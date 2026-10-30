import json
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from accounts.email import send_email
from events.models import (
    AdminEarning,
    AdminWalletCarryForward,
    AdminWithdrawal,
    Event,
    EventPayment,
)
from events.retention import (
    build_event_archive,
    delete_event_media,
    export_event_media,
    has_pending_payments,
)


class Command(BaseCommand):
    help = (
        "Prévisualise, notifie ou purge les données événementielles et financières "
        "selon les durées de conservation MK Events."
    )

    def add_arguments(self, parser):
        actions = parser.add_mutually_exclusive_group()
        actions.add_argument(
            "--send-notices",
            action="store_true",
            help="Envoie un préavis aux organisateurs avant la purge.",
        )
        actions.add_argument(
            "--purge",
            action="store_true",
            help="Exporte puis supprime les événements arrivés à échéance.",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Confirme explicitement la suppression et la purge du ledger.",
        )
        parser.add_argument(
            "--export-dir",
            type=Path,
            help="Dossier local sécurisé où écrire les archives JSON avant suppression.",
        )

    def handle(self, *args, **options):
        if options["confirm"] and not options["purge"]:
            raise CommandError("--confirm ne peut être utilisé qu’avec --purge.")
        if options["purge"] and not options["confirm"]:
            raise CommandError(
                "La purge est destructive : ajoutez --confirm après vérification."
            )
        if options["purge"] and not options["export_dir"]:
            raise CommandError("--export-dir est obligatoire pour exporter avant la purge.")

        now = timezone.now()
        if options["send_notices"]:
            return self.send_notices(now)
        if options["purge"]:
            return self.purge_expired(now, options["export_dir"])

        notice_count = self.events_due_for_notice(now).count()
        purge_count = self.events_due_for_purge(now).count()
        pending_count = Event.objects.filter(
            status__in=(Event.Status.PUBLISHED, Event.Status.ARCHIVED),
            event_date__lte=now - timedelta(days=90),
            payments__status=EventPayment.Status.PENDING,
        ).distinct().count()
        ledger_count = EventPayment.objects.filter(
            status__in=(EventPayment.Status.SUCCEEDED, EventPayment.Status.FAILED),
            updated_at__lte=now - timedelta(days=365),
        ).count()
        self.stdout.write(f"Événements à notifier : {notice_count}")
        self.stdout.write(f"Événements prêts à purger après préavis : {purge_count}")
        self.stdout.write(f"Événements retenus avec paiement en attente : {pending_count}")
        self.stdout.write(f"Paiements financiers terminés de plus d’un an : {ledger_count}")
        self.stdout.write(
            "Aucune donnée supprimée. Utilisez --send-notices, puis "
            "--purge --confirm --export-dir <dossier-sécurisé>."
        )

    @staticmethod
    def events_due_for_notice(now):
        return Event.objects.filter(
            status__in=(Event.Status.PUBLISHED, Event.Status.ARCHIVED),
            event_date__lte=now - timedelta(days=60),
            retention_notice_sent_at__isnull=True,
        ).select_related("organizer")

    @staticmethod
    def events_due_for_purge(now):
        return (
            Event.objects.filter(
                status__in=(Event.Status.PUBLISHED, Event.Status.ARCHIVED),
                event_date__lte=now - timedelta(days=90),
                retention_notice_sent_at__lte=now - timedelta(days=30),
            )
            .exclude(payments__status=EventPayment.Status.PENDING)
            .distinct()
            .order_by("event_date", "id")
        )

    def send_notices(self, now):
        if not settings.RESEND_API_KEY:
            raise CommandError("RESEND_API_KEY est nécessaire pour envoyer les préavis.")
        events = list(self.events_due_for_notice(now))
        sent = 0
        failures = []
        for event in events:
            frontend = settings.FRONTEND_URL.rstrip("/")
            manage_url = f"{frontend}/invitations/{event.id}"
            days_until_purge = max(0, 90 - (now - event.event_date).days)
            result = send_email(
                to=event.organizer.email,
                subject=f"MK Events : exportez vos données — {event.name}",
                text=(
                    f"Bonjour {event.organizer.full_name or 'Organisateur'},\n\n"
                    f"L’événement « {event.name} » est terminé. Conformément à notre "
                    "politique de conservation, ses données (invités, RSVP et contenu) "
                    "seront supprimées après le délai prévu de 90 jours.\n\n"
                    f"Vous pouvez exporter l’événement et sa liste d’invités depuis "
                    f"MK Events : {manage_url}\n\n"
                    f"La suppression ne pourra pas intervenir avant 30 jours à compter "
                    f"de ce préavis (échéance estimée dans {days_until_purge} jour(s)). "
                    "Les paiements encore en attente empêchent la purge jusqu’à leur "
                    "résolution.\n\n— L’équipe MK Events"
                ),
            )
            if result:
                Event.objects.filter(
                    pk=event.pk,
                    retention_notice_sent_at__isnull=True,
                ).update(retention_notice_sent_at=now)
                sent += 1
            else:
                failures.append(event.pk)
                self.stderr.write(
                    self.style.ERROR(f"Échec du préavis pour l’événement {event.pk}.")
                )
        self.stdout.write(self.style.SUCCESS(f"Préavis envoyés : {sent}/{len(events)}"))
        if failures:
            raise CommandError(
                f"Échec d’envoi pour {len(failures)} événement(s) : "
                + ", ".join(str(event_id) for event_id in failures)
            )

    def purge_expired(self, now, export_dir: Path):
        export_dir = export_dir.expanduser().resolve()
        export_dir.mkdir(parents=True, exist_ok=True)
        events = list(self.events_due_for_purge(now))
        deleted = 0
        for candidate in events:
            with transaction.atomic():
                event = (
                    Event.objects.select_for_update()
                    .select_related("organizer", "template")
                    .get(pk=candidate.pk)
                )
                if (
                    event.event_date > now - timedelta(days=90)
                    or event.retention_notice_sent_at is None
                    or event.retention_notice_sent_at > now - timedelta(days=30)
                    or has_pending_payments(event)
                ):
                    continue
                archive_path = export_dir / f"mk-event-{event.pk}-archive.json"
                media_export_dir = export_dir / f"mk-event-{event.pk}-media"
                if archive_path.exists():
                    raise CommandError(
                        f"L’archive existe déjà, arrêt sans écrasement : {archive_path}"
                    )
                if media_export_dir.exists():
                    raise CommandError(
                        f"Le dossier d’archive média existe déjà, arrêt sans écrasement : "
                        f"{media_export_dir}"
                    )
                archive = build_event_archive(event)
                archive["media_files"] = export_event_media(event.pk, media_export_dir)
                with archive_path.open("x", encoding="utf-8") as archive_file:
                    json.dump(
                        archive,
                        archive_file,
                        ensure_ascii=False,
                        indent=2,
                        cls=DjangoJSONEncoder,
                    )
                delete_event_media(event.pk)
                event.delete()
                deleted += 1
                self.stdout.write(f"Archive créée : {archive_path}")

        pruned_payments = self.purge_financial_ledger(now - timedelta(days=365))
        self.stdout.write(
            self.style.SUCCESS(
                f"Événements supprimés : {deleted}. "
                f"Paiements financiers détaillés purgés : {pruned_payments}."
            )
        )
        return None

    @staticmethod
    def purge_financial_ledger(cutoff):
        payments = EventPayment.objects.filter(
            status__in=(EventPayment.Status.SUCCEEDED, EventPayment.Status.FAILED),
            updated_at__lte=cutoff,
        )
        withdrawals = AdminWithdrawal.objects.filter(
            status__in=(AdminWithdrawal.Status.SUCCEEDED, AdminWithdrawal.Status.FAILED),
            updated_at__lte=cutoff,
        )
        payment_count = payments.count()

        earning_totals = {
            (row["user_id"], row["currency"]): row["total"]
            for row in AdminEarning.objects.filter(payment__in=payments)
            .values("user_id", "currency")
            .annotate(total=Sum("amount"))
        }
        withdrawal_totals = {
            (row["user_id"], row["currency"]): row["total"]
            for row in withdrawals.filter(status=AdminWithdrawal.Status.SUCCEEDED)
            .values("user_id", "currency")
            .annotate(total=Sum("amount_debited"))
        }
        with transaction.atomic():
            user_ids = sorted(
                {user_id for user_id, _currency in earning_totals.keys() | withdrawal_totals.keys()}
            )
            if user_ids:
                from django.contrib.auth import get_user_model

                list(get_user_model().objects.select_for_update().filter(pk__in=user_ids))

            for user_id, currency in earning_totals.keys() | withdrawal_totals.keys():
                carry, _ = AdminWalletCarryForward.objects.select_for_update().get_or_create(
                    user_id=user_id,
                    currency=currency,
                    defaults={"balance": 0},
                )
                carry.balance = max(
                    Decimal("0.00"),
                    carry.balance
                    + earning_totals.get((user_id, currency), 0)
                    - withdrawal_totals.get((user_id, currency), 0),
                )
                if carry.balance:
                    carry.save(update_fields=["balance", "updated_at"])
                else:
                    carry.delete()

            AdminEarning.objects.filter(payment__in=payments).delete()
            withdrawals.delete()
            payments.delete()

        return payment_count
