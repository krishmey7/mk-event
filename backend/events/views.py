import os
import hashlib
import hmac
import logging
import uuid
from decimal import Decimal, InvalidOperation, ROUND_DOWN
import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .media_upload import MediaUploadError, absolute_media_url, save_event_media
from .models import (
    AdminEarning,
    AdminWithdrawal,
    Event,
    EventPayment,
    Guest,
    GuestbookEntry,
    RSVPResponse,
    Table,
    make_studio_key,
)
from .payouts import AdminWalletView, AdminWithdrawalView
from .retention import build_event_archive
from .serializers import (
    EventDraftSerializer,
    EventSerializer,
    EventPaySerializer,
    GuestbookCreateSerializer,
    GuestbookEntrySerializer,
    GuestSerializer,
    GuestWriteSerializer,
    PublicEventSerializer,
    PublicGuestSerializer,
    RSVPSubmitSerializer,
    TableSerializer,
    sanitize_public_studio_config,
)

logger = logging.getLogger(__name__)
User = get_user_model()


def _kibawallet_error_message(response):
    try:
        payload = response.json()
    except ValueError:
        return ""
    if not isinstance(payload, dict):
        return ""

    for key in ("detail", "message", "error", "description"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()[:300]
        if isinstance(value, dict):
            for nested_key in ("message", "detail", "description"):
                nested_value = value.get(nested_key)
                if isinstance(nested_value, str) and nested_value.strip():
                    return nested_value.strip()[:300]
    return ""


def annotate_events(qs):
    return qs.annotate(
        guests_count=Count("guests", distinct=True),
        confirmed_count=Count(
            "guests",
            filter=Q(guests__rsvp_status=Guest.RsvpStatus.CONFIRMED),
            distinct=True,
        ),
        pending_count=Count(
            "guests",
            filter=Q(guests__rsvp_status=Guest.RsvpStatus.PENDING),
            distinct=True,
        ),
        maybe_count=Count(
            "guests",
            filter=Q(guests__rsvp_status=Guest.RsvpStatus.MAYBE),
            distinct=True,
        ),
        declined_count=Count(
            "guests",
            filter=Q(guests__rsvp_status=Guest.RsvpStatus.DECLINED),
            distinct=True,
        ),
    )


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return annotate_events(
            Event.objects.filter(organizer=self.request.user).select_related("template")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return EventDraftSerializer
        return EventSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user, status=Event.Status.DRAFT)

    def create(self, request, *args, **kwargs):
        draft = EventDraftSerializer(data=request.data)
        draft.is_valid(raise_exception=True)
        event = draft.save(organizer=request.user, status=Event.Status.DRAFT)
        event = annotate_events(Event.objects.filter(pk=event.pk)).get()
        return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)

    def _sync_studio(self, event, request, *, publish, free_publication=False):
        from django.db import IntegrityError
        from django.utils.text import slugify

        slug = (request.data.get("slug") or "").strip()
        if slug:
            base = slugify(slug) or event.slug
            candidate = base
            suffix = 1
            while (
                Event.objects.filter(slug=candidate).exclude(pk=event.pk).exists()
            ):
                suffix += 1
                candidate = f"{base}-{suffix}"
            event.slug = candidate

        synced_guests = []
        submitted_keys: set[str] = set()
        submitted_ids: set[int] = set()
        for raw in request.data.get("guests") or []:
            if not isinstance(raw, dict):
                continue
            full_name = (raw.get("full_name") or "").strip()
            if not full_name:
                continue

            studio_key = (
                (raw.get("studio_key") or raw.get("client_id") or "").strip()[:64] or None
            )
            try:
                guest_id = int(raw.get("guest_id")) if raw.get("guest_id") not in (None, "") else None
            except (TypeError, ValueError):
                guest_id = None

            # Identité : PK Django (legacy fiable) puis clé studio stable.
            guest = None
            if guest_id is not None:
                guest = Guest.objects.filter(event=event, pk=guest_id).first()
            if guest is None and studio_key:
                guest = Guest.objects.filter(event=event, studio_key=studio_key).first()
            if guest is None:
                guest = Guest(event=event)

            # Une clé studio ne doit jamais « voler » celle d'un autre invité.
            if studio_key and (
                Guest.objects.filter(event=event, studio_key=studio_key)
                .exclude(pk=guest.pk)
                .exists()
            ):
                studio_key = None
            if not studio_key:
                studio_key = guest.studio_key or make_studio_key()
                while (
                    Guest.objects.filter(event=event, studio_key=studio_key)
                    .exclude(pk=guest.pk)
                    .exists()
                ):
                    studio_key = make_studio_key()

            contact = (raw.get("contact") or "").strip()
            email = raw.get("email")
            phone = raw.get("phone")
            if contact and "@" in contact:
                email = contact
            elif contact:
                phone = contact

            adults = max(1, int(raw.get("adults_count") or raw.get("seats") or 1))
            children = int(raw.get("children_count") or 0)

            def apply_fields(target: Guest) -> None:
                target.full_name = full_name
                target.email = email or None
                target.phone = phone or None
                target.adults_count = adults
                target.children_count = children
                target.studio_key = studio_key

            apply_fields(guest)
            try:
                guest.save()
            except IntegrityError:
                # Course concurrente sur la clé : on reprend la ligne existante.
                guest = Guest.objects.filter(event=event, studio_key=studio_key).first()
                if guest is None:
                    continue
                apply_fields(guest)
                guest.save()

            submitted_keys.add(guest.studio_key or studio_key)
            submitted_ids.add(guest.pk)
            synced_guests.append(GuestSerializer(guest).data)

        # Suppressions explicites du studio — jamais implicites (évite de
        # perdre un invité ajouté entre-temps depuis la gestion).
        deleted_keys = {
            str(value).strip()
            for value in (request.data.get("deleted_guest_keys") or [])
            if str(value).strip()
        } - submitted_keys
        if deleted_keys:
            Guest.objects.filter(event=event, studio_key__in=deleted_keys).delete()

        deleted_ids: set[int] = set()
        for value in request.data.get("deleted_guest_ids") or []:
            try:
                deleted_ids.add(int(value))
            except (TypeError, ValueError):
                continue
        deleted_ids -= submitted_ids
        if deleted_ids:
            Guest.objects.filter(event=event, pk__in=deleted_ids).delete()

        if publish:
            event.status = Event.Status.PUBLISHED
            if free_publication:
                event.payment_status = "free"
        update_fields = ["slug", "status", "updated_at"]
        if publish and free_publication:
            update_fields.append("payment_status")
        studio_config = request.data.get("studio_config")
        if isinstance(studio_config, dict):
            # Ne pas persister la liste d'invités dans le snapshot (PII) —
            # les invités sont synchronisés via le tableau `guests` ci-dessus.
            event.studio_config = sanitize_public_studio_config(studio_config)
            update_fields.append("studio_config")
            theme_from_config = studio_config.get("themeKey")
            if isinstance(theme_from_config, str) and theme_from_config.strip():
                event.theme_key = theme_from_config.strip()[:40]
                update_fields.append("theme_key")
        theme_key = request.data.get("theme_key")
        if isinstance(theme_key, str) and theme_key.strip():
            event.theme_key = theme_key.strip()[:40]
            if "theme_key" not in update_fields:
                update_fields.append("theme_key")
        event.save(update_fields=update_fields)
        if publish and free_publication:
            Guest.objects.filter(event=event).update(
                has_personal_link=False,
                payment_batch=None,
            )
        event = annotate_events(Event.objects.filter(pk=event.pk)).get()
        return Response(
            {
                "event": EventSerializer(event).data,
                "guests": synced_guests,
            }
        )

    @action(detail=True, methods=["post"], url_path="prepare")
    def prepare(self, request, pk=None):
        """Enregistre le studio et ses invités sans publier l’événement."""
        event = self.get_object()
        if event.status != Event.Status.DRAFT:
            return Response(
                {"detail": "Seul un brouillon peut être préparé pour publication."},
                status=status.HTTP_409_CONFLICT,
            )
        return self._sync_studio(event, request, publish=False)

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        """Publie une vitrine gratuite ou republie un événement déjà publié."""
        event = self.get_object()
        free_publication = (
            event.status == Event.Status.DRAFT
            and request.data.get("free_publication") is True
        )
        if event.status == Event.Status.DRAFT and not free_publication:
            return Response(
                {"detail": "Un brouillon doit être payé ou publié gratuitement."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        if free_publication and event.payments.filter(
            status=EventPayment.Status.PENDING,
        ).exists():
            return Response(
                {"detail": "Un paiement est en cours. Attendez son résultat avant de publier gratuitement."},
                status=status.HTTP_409_CONFLICT,
            )
        return self._sync_studio(
            event,
            request,
            publish=True,
            free_publication=free_publication,
        )

    @action(detail=True, methods=["post"], url_path="media")
    def upload_media(self, request, pk=None):
        """POST multipart — image ou audio dans le stockage média (S3 ou local)."""
        event = self.get_object()
        uploaded = request.FILES.get("file")
        try:
            relative = save_event_media(event.id, uploaded)
        except MediaUploadError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"url": absolute_media_url(request, relative)},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="export")
    def export_data(self, request, pk=None):
        """Export privé complet d’un événement avant la purge de ses données."""
        event = self.get_object()
        return Response(build_event_archive(event))


class EventNestedMixin:
    def get_event(self) -> Event:
        return get_object_or_404(Event, pk=self.kwargs["event_id"], organizer=self.request.user)


class GuestViewSet(EventNestedMixin, viewsets.ModelViewSet):
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        event = self.get_event()
        return Guest.objects.filter(event=event).select_related("table")

    def get_serializer_class(self):
        if self.action in {"create", "partial_update", "update"}:
            return GuestWriteSerializer
        return GuestSerializer

    def perform_create(self, serializer):
        serializer.save(event=self.get_event())

    def create(self, request, *args, **kwargs):
        write = GuestWriteSerializer(data=request.data)
        write.is_valid(raise_exception=True)
        guest = write.save(event=self.get_event())
        return Response(GuestSerializer(guest).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        guest = self.get_object()
        write = GuestWriteSerializer(guest, data=request.data, partial=True)
        write.is_valid(raise_exception=True)
        guest = write.save()
        return Response(GuestSerializer(guest).data)

    @action(detail=True, methods=["post"], url_path="check-in")
    def check_in(self, request, event_id=None, pk=None):
        guest = self.get_object()
        if guest.rsvp_status != Guest.RsvpStatus.CONFIRMED:
            return Response(
                {"detail": "L’invité n’a pas confirmé sa présence."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if guest.checked_in:
            return Response(GuestSerializer(guest).data)
        guest.checked_in = True
        guest.checked_in_at = timezone.now()
        guest.save(update_fields=["checked_in", "checked_in_at"])
        return Response(GuestSerializer(guest).data)

    @action(detail=True, methods=["post"], url_path="grant-link")
    def grant_link(self, request, event_id=None, pk=None):
        event = self.get_event()
        guest = self.get_object()
        if event.status != Event.Status.PUBLISHED:
            return Response(
                {"detail": "Publiez l’événement avant de partager un lien invité."},
                status=status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():
            event = Event.objects.select_for_update().get(pk=event.pk)
            guest = Guest.objects.select_for_update().get(pk=guest.pk, event=event)
            if not guest.has_personal_link:
                if event.paid_guest_quota <= event.paid_guest_count:
                    return Response(
                        {"detail": "Aucun crédit de lien invité disponible."},
                        status=status.HTTP_402_PAYMENT_REQUIRED,
                    )
                payment = event.payments.filter(status=EventPayment.Status.SUCCEEDED).first()
                guest.has_personal_link = True
                guest.payment_batch = payment
                guest.save(update_fields=["has_personal_link", "payment_batch"])
                event.paid_guest_count += 1
                event.save(update_fields=["paid_guest_count", "updated_at"])
        return Response(GuestSerializer(guest).data)


class TableViewSet(EventNestedMixin, viewsets.ModelViewSet):
    serializer_class = TableSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        event = self.get_event()
        return Table.objects.filter(event=event).prefetch_related("guests")

    def perform_create(self, serializer):
        serializer.save(event=self.get_event())

    def create(self, request, *args, **kwargs):
        serializer = TableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        table = serializer.save(event=self.get_event())
        return Response(TableSerializer(table).data, status=status.HTTP_201_CREATED)


class PublicInvitationView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public_invite"

    def get(self, request, slug: str):
        event = get_object_or_404(
            Event.objects.filter(status=Event.Status.PUBLISHED).select_related("template"),
            slug=slug,
        )
        # Uniquement access_token — pas de studio_key / pk (énumération).
        token = (request.query_params.get("guest") or "").strip()
        payload = {
            "event": PublicEventSerializer(event).data,
            "guest": None,
        }
        if token:
            guest = (
                Guest.objects.filter(event=event, access_token=token)
                .select_related("table")
                .first()
            )
            if guest and guest.has_personal_link:
                payload["guest"] = PublicGuestSerializer(guest).data
        return Response(payload)


class PublicRSVPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public_rsvp"

    def post(self, request, slug: str):
        event = get_object_or_404(Event, slug=slug, status=Event.Status.PUBLISHED)
        serializer = RSVPSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        token = (data.get("access_token") or "").strip()
        if not token:
            return Response(
                {"detail": "Jeton invité manquant (access_token)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        guest = Guest.objects.filter(event=event, access_token=token).first()
        if guest is None or not guest.has_personal_link:
            return Response({"detail": "Invité introuvable."}, status=status.HTTP_404_NOT_FOUND)

        answer = data["answer"]
        adults = data["adults_count"]
        children = data["children_count"]
        message = data.get("message") or None
        drink = data.get("drink") or None

        rsvp, _ = RSVPResponse.objects.update_or_create(
            guest=guest,
            defaults={
                "event": event,
                "answer": answer,
                "adults_count": adults,
                "children_count": children,
                "message": message,
            },
        )

        guest.rsvp_status = RSVPResponse.ANSWER_TO_STATUS[answer]
        guest.adults_count = max(1, adults) if answer != RSVPResponse.Answer.NO else adults
        guest.children_count = children
        guest.responded_at = timezone.now()
        if drink is not None:
            guest.drink = drink or None
        if answer == RSVPResponse.Answer.NO:
            guest.checked_in = False
            guest.checked_in_at = None
            guest.drink = None
        guest.save()

        return Response(
            {
                "id": rsvp.id,
                "guest": guest.id,
                "event": event.id,
                "answer": rsvp.answer,
                "adults_count": rsvp.adults_count,
                "children_count": rsvp.children_count,
                "message": rsvp.message,
                "responded_at": rsvp.responded_at,
                "guest_detail": PublicGuestSerializer(guest).data,
            },
            status=status.HTTP_200_OK,
        )


class PublicGuestbookView(APIView):
    """GET/POST livre d’or public — invitation publiée uniquement."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]

    def get_throttles(self):
        self.throttle_scope = (
            "public_guestbook_write"
            if self.request.method == "POST"
            else "public_guestbook_read"
        )
        return [ScopedRateThrottle()]

    def get(self, request, slug: str):
        event = get_object_or_404(Event, slug=slug, status=Event.Status.PUBLISHED)
        qs = GuestbookEntry.objects.filter(event=event, is_visible=True)
        return Response(GuestbookEntrySerializer(qs, many=True).data)

    def post(self, request, slug: str):
        event = get_object_or_404(Event, slug=slug, status=Event.Status.PUBLISHED)
        serializer = GuestbookCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"].strip()
        if not message:
            return Response(
                {"detail": "Le message ne peut pas être vide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = (serializer.validated_data.get("access_token") or "").strip()
        guest = None
        author_name = "Invité"
        if token:
            guest = Guest.objects.filter(event=event, access_token=token).first()
            if guest:
                author_name = (guest.full_name or "").strip() or "Invité"

        entry = GuestbookEntry.objects.create(
            event=event,
            guest=guest,
            author_name=author_name[:120],
            message=message[:500],
            is_visible=True,
        )
        return Response(
            GuestbookEntrySerializer(entry).data,
            status=status.HTTP_201_CREATED,
        )


class EventGuestbookViewSet(EventNestedMixin, viewsets.ViewSet):
    """Liste / suppression des messages — organisateur."""

    def list(self, request, event_id=None):
        event = self.get_event()
        qs = GuestbookEntry.objects.filter(event=event)
        return Response(GuestbookEntrySerializer(qs, many=True).data)

    def destroy(self, request, event_id=None, pk=None):
        event = self.get_event()
        entry = get_object_or_404(GuestbookEntry, pk=pk, event=event)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventPayView(APIView):
    """Create a KibaWallet payment and record its guest-link quota."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "payment"

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk, organizer=request.user)
        serializer = EventPaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guest_quota = serializer.validated_data["guest_quota"]
        payment_method = serializer.validated_data["payment_method"]
        amount = Decimal(guest_quota) * Decimal("0.50")
        kiba_pk = os.getenv("KIBA_PUBLIC_KEY", "").strip()
        kiba_sk = os.getenv("KIBA_SECRET_KEY", "").strip()
        if not kiba_pk or not kiba_sk:
            return Response(
                {"detail": "Paiement non configuré sur le serveur."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        with transaction.atomic():
            event = get_object_or_404(
                Event.objects.select_for_update(),
                pk=pk,
                organizer=request.user,
            )
            if event.status == Event.Status.ARCHIVED:
                return Response(
                    {"detail": "Un événement archivé ne peut pas recevoir de paiement."},
                    status=status.HTTP_409_CONFLICT,
                )

            pending_payment = EventPayment.objects.filter(
                event=event,
                status=EventPayment.Status.PENDING,
            ).first()
            if pending_payment:
                return Response(
                    {
                        "detail": "Un paiement est déjà en cours pour cet événement.",
                        "payment_id": pending_payment.provider_payment_id,
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            external_reference = f"inv-{event.id}-{uuid.uuid4().hex}"
            payment = EventPayment.objects.create(
                event=event,
                external_reference=external_reference,
                payment_method=payment_method,
                guest_quota=guest_quota,
                amount=amount,
            )
            event.payment_status = "pending"
            event.save(update_fields=["payment_status", "updated_at"])

        payload = {
            "amount": float(amount),
            "currency": "USD",
            "external_reference": external_reference,
        }
        if payment_method == EventPayment.Method.MOBILE_MONEY:
            payload["mobilenumber"] = serializer.validated_data["mobilenumber"].strip()
        else:
            payload["payment_method"] = payment_method
            payload["return_url"] = (
                f"{settings.FRONTEND_URL}/pay/success?eventId={event.id}"
            )

        try:
            response = requests.post(
                "https://kibawallet-api.onrender.com/v1/payments",
                headers={
                    "Content-Type": "application/json",
                    "X-Kiba-Public-Key": kiba_pk,
                    "Authorization": f"Bearer {kiba_sk}",
                },
                json=payload,
                timeout=30,
            )
        except requests.RequestException:
            return Response(
                {
                    "detail": (
                        "Le prestataire n’a pas répondu. Vérifiez le statut du paiement "
                        "avant d’en initier un autre."
                    ),
                    "external_reference": external_reference,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not response.ok:
            payment.status = EventPayment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            if not event.payments.filter(status=EventPayment.Status.PENDING).exists():
                event.payment_status = (
                    "succeeded"
                    if event.paid_guest_quota > 0
                    or event.payments.filter(status=EventPayment.Status.SUCCEEDED).exists()
                    else "failed"
                )
                event.save(update_fields=["payment_status", "updated_at"])
            provider_error = _kibawallet_error_message(response)
            logger.warning(
                "KibaWallet rejected payment initialization: method=%s status=%s reference=%s message=%s",
                payment_method,
                response.status_code,
                external_reference,
                provider_error or "no provider message",
            )
            return Response(
                {
                    "detail": (
                        f"Échec de l’initialisation KibaWallet "
                        f"(HTTP {response.status_code})."
                        + (f" {provider_error}" if provider_error else "")
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            data = response.json()
        except ValueError:
            payment.status = EventPayment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            if not event.payments.filter(status=EventPayment.Status.PENDING).exclude(
                pk=payment.pk,
            ).exists():
                event.payment_status = "succeeded" if event.paid_guest_quota else "failed"
                event.save(update_fields=["payment_status", "updated_at"])
            return Response(
                {"detail": "Réponse invalide du prestataire de paiement."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if not isinstance(data, dict):
            payment.status = EventPayment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            if not event.payments.filter(status=EventPayment.Status.PENDING).exclude(
                pk=payment.pk,
            ).exists():
                event.payment_status = "succeeded" if event.paid_guest_quota else "failed"
                event.save(update_fields=["payment_status", "updated_at"])
            return Response(
                {"detail": "Réponse invalide du prestataire de paiement."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        provider_id = data.get("id") or data.get("payment_id")
        if not provider_id:
            payment.status = EventPayment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            if not event.payments.filter(status=EventPayment.Status.PENDING).exclude(
                pk=payment.pk,
            ).exists():
                event.payment_status = "succeeded" if event.paid_guest_quota else "failed"
                event.save(update_fields=["payment_status", "updated_at"])
            return Response(
                {"detail": "Identifiant de paiement absent de la réponse KibaWallet."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment.provider_payment_id = str(provider_id)
        provider_currency = str(data.get("currency") or "USD").upper()
        if provider_currency not in {"USD", "CDF"}:
            payment.status = EventPayment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            return Response(
                {"detail": "Devise KibaWallet non prise en charge."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        payment.currency = provider_currency
        provider_net = data.get("amount_net")
        if provider_net is not None:
            try:
                payment.amount_net = Decimal(str(provider_net))
            except InvalidOperation:
                payment.status = EventPayment.Status.FAILED
                payment.save(update_fields=["status", "updated_at"])
                return Response(
                    {"detail": "Montant net KibaWallet invalide."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            if payment.amount_net < 0 or payment.amount_net > payment.amount:
                payment.status = EventPayment.Status.FAILED
                payment.save(update_fields=["status", "updated_at"])
                return Response(
                    {"detail": "Montant net KibaWallet incohérent."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
        payment.save(
            update_fields=[
                "provider_payment_id",
                "currency",
                "amount_net",
                "updated_at",
            ]
        )
        event.payment_reference = str(provider_id)
        event.save(update_fields=["payment_reference", "updated_at"])

        return Response(
            {
                "payment_id": str(provider_id),
                "reference": data.get("reference"),
                "external_reference": external_reference,
                "amount_gross": data.get("amount_gross"),
                "amount_net": data.get("amount_net"),
                "currency": data.get("currency", "USD"),
                "status": data.get("status", "PENDING"),
                "checkout_url": data.get("checkout_url"),
                "instructions": data.get("instructions") or data.get("kelpay"),
                "payment_method": payment_method,
                "guest_quota": guest_quota,
                "amount_due": str(amount),
            },
            status=status.HTTP_201_CREATED,
        )


class EventPaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        event = get_object_or_404(Event, pk=pk, organizer=request.user)
        payment_id = request.query_params.get("payment_id")
        payment = event.payments.first()
        if payment_id:
            payment = event.payments.filter(provider_payment_id=payment_id).first()
            if payment is None:
                return Response(
                    {"detail": "Paiement introuvable."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        total_guests = event.guests.count()
        pending_count = event.guests.filter(has_personal_link=False).count()
        available_credits = max(0, event.paid_guest_quota - event.paid_guest_count)
        amount_due = max(0, pending_count - available_credits) * Decimal("0.50")
        return Response(
            {
                "event_id": event.id,
                "event_status": event.status,
                "payment_status": event.payment_status,
                "total_guests": total_guests,
                "paid_guest_quota": event.paid_guest_quota,
                "paid_guest_count": event.paid_guest_count,
                "available_credits": available_credits,
                "pending_count": pending_count,
                "amount_due": str(amount_due),
                "currency": event.currency or "USD",
                "payment": (
                    {
                        "payment_id": payment.provider_payment_id,
                        "external_reference": payment.external_reference,
                        "status": payment.status,
                        "payment_method": payment.payment_method,
                        "guest_quota": payment.guest_quota,
                    }
                    if payment
                    else None
                ),
            }
        )


class KibaWalletWebhookView(APIView):
    """Verify and idempotently process KibaWallet payment callbacks."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "webhook"

    def post(self, request):
        secret = getattr(settings, "KIBA_WEBHOOK_SECRET", "")
        signature = request.headers.get("X-Kiba-Signature", "")
        if not secret:
            return Response(
                {"detail": "Webhook de paiement non configuré."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        expected = hmac.new(
            secret.encode("utf-8"),
            request.body,
            hashlib.sha256,
        ).hexdigest()
        if not signature or not hmac.compare_digest(expected, signature):
            return Response(
                {"detail": "Signature webhook invalide."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        payload = request.data
        data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
        event_name = str(payload.get("event") or "").lower()
        if event_name in {"withdrawal.success", "withdrawal.failed"}:
            return self._process_withdrawal(data, event_name)

        callback_status = str(data.get("status") or "").upper()
        if event_name == "payment.success":
            callback_status = "SUCCEEDED"
        elif event_name == "payment.failed":
            callback_status = "FAILED"
        if callback_status not in {"SUCCEEDED", "FAILED"}:
            return Response(
                {"detail": "Statut de paiement inconnu."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        external_reference = str(data.get("external_reference") or "").strip()
        provider_id = str(
            data.get("transaction_id") or data.get("id") or data.get("payment_id") or ""
        ).strip()
        payment = EventPayment.objects.filter(
            external_reference=external_reference,
        ).first()
        if payment is None and provider_id:
            payment = EventPayment.objects.filter(
                provider_payment_id=provider_id,
            ).first()
        if payment is None:
            return Response(
                {"detail": "Paiement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        gross = data.get("amount_gross") or data.get("amount")
        if gross is not None:
            try:
                if Decimal(str(gross)) != payment.amount:
                    return Response(
                        {"detail": "Le montant du webhook ne correspond pas au paiement."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except InvalidOperation:
                return Response(
                    {"detail": "Montant invalide dans le webhook."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        currency = str(data.get("currency") or payment.currency).upper()
        if currency != payment.currency:
            return Response(
                {"detail": "La devise du webhook ne correspond pas au paiement."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider_net = data.get("amount_net", payment.amount_net)
        if callback_status == "SUCCEEDED":
            if provider_net is None:
                return Response(
                    {"detail": "Le montant net KibaWallet est requis pour créditer les parts."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                provider_net = Decimal(str(provider_net))
            except InvalidOperation:
                return Response(
                    {"detail": "Montant net invalide dans le webhook."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if provider_net < 0 or provider_net > payment.amount:
                return Response(
                    {"detail": "Montant net incohérent dans le webhook."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            payment = EventPayment.objects.select_for_update().get(pk=payment.pk)
            if payment.status != EventPayment.Status.PENDING:
                return Response({"status": "ok", "event_id": payment.event_id})
            if payment.event_id is None:
                return Response(
                    {"detail": "L’événement associé à ce paiement n’existe plus."},
                    status=status.HTTP_410_GONE,
                )
            event = Event.objects.select_for_update().get(pk=payment.event_id)

            if provider_id and not payment.provider_payment_id:
                payment.provider_payment_id = provider_id
            if callback_status == "SUCCEEDED":
                admins = list(
                    User.objects.select_for_update()
                    .filter(Q(is_superuser=True) | Q(role=User.Role.ADMIN), is_active=True)
                    .order_by("id")
                )
                total_share = sum(
                    (admin.payout_share_percent for admin in admins),
                    Decimal("0.00"),
                )
                if total_share > 100:
                    logger.error(
                        "Admin payout shares exceed 100%%; payment=%s shares=%s",
                        payment.external_reference,
                        total_share,
                    )
                    return Response(
                        {"detail": "La configuration des parts administrateur dépasse 100 %."},
                        status=status.HTTP_409_CONFLICT,
                    )
                earning_rows = []
                for admin in admins:
                    share_percent = admin.payout_share_percent
                    earning_amount = (
                        provider_net * share_percent / Decimal("100")
                    ).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
                    if share_percent > 0 and earning_amount > 0:
                        earning_rows.append(
                            AdminEarning(
                                user=admin,
                                payment=payment,
                                share_percent=share_percent,
                                amount=earning_amount,
                                currency=payment.currency,
                            )
                        )
                payment.status = EventPayment.Status.SUCCEEDED
                payment.paid_at = timezone.now()
                payment.amount_net = provider_net
                event.paid_guest_quota += payment.guest_quota
                event.amount_paid_total += payment.amount
                event.currency = payment.currency
                event.payment_status = "succeeded"
                if event.status == Event.Status.DRAFT:
                    event.status = Event.Status.PUBLISHED
                available = max(0, event.paid_guest_quota - event.paid_guest_count)
                guests = list(
                    Guest.objects.select_for_update()
                    .filter(event=event, has_personal_link=False)
                    .order_by("id")[:available]
                )
                for guest in guests:
                    guest.has_personal_link = True
                    guest.payment_batch = payment
                if guests:
                    Guest.objects.bulk_update(
                        guests,
                        ["has_personal_link", "payment_batch"],
                    )
                    event.paid_guest_count += len(guests)
                if earning_rows:
                    AdminEarning.objects.bulk_create(earning_rows)
            else:
                payment.status = EventPayment.Status.FAILED
                has_other_payment = event.payments.filter(
                    status=EventPayment.Status.PENDING,
                ).exclude(pk=payment.pk).exists()
                if not has_other_payment:
                    event.payment_status = (
                        "succeeded"
                        if event.paid_guest_quota > 0
                        or event.payments.filter(
                            status=EventPayment.Status.SUCCEEDED,
                        ).exclude(pk=payment.pk).exists()
                        else "failed"
                    )

            payment.save(
                update_fields=[
                    "provider_payment_id",
                    "status",
                    "paid_at",
                    "amount_net",
                    "updated_at",
                ]
            )
            event.save(
                update_fields=[
                    "status",
                    "payment_status",
                    "paid_guest_quota",
                    "paid_guest_count",
                    "amount_paid_total",
                    "currency",
                    "updated_at",
                ]
            )
        return Response({"status": "ok", "event_id": event.id})
        return Response({"status": "ok", "event_id": event.id})
    def _process_withdrawal(self, data, event_name):
        external_reference = str(data.get("external_reference") or "").strip()
        withdrawal_id = str(
            data.get("withdrawal_id") or data.get("id") or data.get("transaction_id") or ""
        ).strip()
        withdrawal = AdminWithdrawal.objects.filter(
            external_reference=external_reference,
        ).first()
        if withdrawal is None and withdrawal_id:
            withdrawal = AdminWithdrawal.objects.filter(
                provider_withdrawal_id=withdrawal_id,
            ).first()
        if withdrawal is None:
            return Response(
                {"detail": "Retrait introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        callback_currency = str(data.get("currency") or withdrawal.currency).upper()
        if callback_currency != withdrawal.currency:
            return Response(
                {"detail": "La devise du webhook ne correspond pas au retrait."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        callback_amount = data.get("amount")
        if callback_amount is not None:
            try:
                if Decimal(str(callback_amount)) != withdrawal.amount:
                    return Response(
                        {"detail": "Le montant du webhook ne correspond pas au retrait."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except InvalidOperation:
                return Response(
                    {"detail": "Montant invalide dans le webhook."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            withdrawal = AdminWithdrawal.objects.select_for_update().get(pk=withdrawal.pk)
            if withdrawal.status != AdminWithdrawal.Status.PENDING:
                return Response({"status": "ok", "external_reference": external_reference})
            withdrawal.provider_withdrawal_id = (
                withdrawal.provider_withdrawal_id or withdrawal_id or None
            )
            withdrawal.provider_reference = str(
                data.get("kelpay_reference") or withdrawal.provider_reference
            )
            withdrawal.status = (
                AdminWithdrawal.Status.SUCCEEDED
                if event_name == "withdrawal.success"
                else AdminWithdrawal.Status.FAILED
            )
            withdrawal.completed_at = timezone.now()
            withdrawal.save(
                update_fields=[
                    "provider_withdrawal_id",
                    "provider_reference",
                    "status",
                    "completed_at",
                    "updated_at",
                ]
            )
        return Response({"status": "ok", "external_reference": external_reference})
