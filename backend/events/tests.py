from datetime import timedelta
from decimal import Decimal
import hashlib
import hmac
from io import BytesIO
import json
from pathlib import Path
import shutil
import tempfile
from io import StringIO
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import RequestFactory, TestCase, override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from events.media_upload import (
    MediaUploadError,
    absolute_media_url,
    save_event_audio,
    save_event_image,
)
from events.models import (
    AdminEarning,
    AdminWalletCarryForward,
    AdminWithdrawal,
    Event,
    EventPayment,
    Guest,
    GuestbookEntry,
    InvitationTemplate,
    RSVPResponse,
    Table,
)
from events.payouts import _ledger_balance
from events.management.commands.process_data_retention import Command as DataRetentionCommand


User = get_user_model()


def _jpeg_file(name="photo.jpg", size=(80, 60)):
    buffer = BytesIO()
    Image.new("RGB", size, color=(200, 120, 80)).save(buffer, format="JPEG")
    buffer.seek(0)
    buffer.name = name
    buffer.content_type = "image/jpeg"
    return buffer


def _mp3_file(name="ambiance.mp3"):
    # En-tête ID3 minimale + payload factice — suffisant pour l’upload.
    payload = b"ID3" + b"\x00" * 32 + b"\xff\xfb\x90\x00" + b"\x00" * 200
    buffer = BytesIO(payload)
    buffer.seek(0)
    buffer.name = name
    buffer.content_type = "audio/mpeg"
    return buffer


class TempMediaRootMixin:
    """Isole les uploads de test dans un dossier temporaire."""

    @classmethod
    def setUpClass(cls):
        cls._media_dir = tempfile.mkdtemp(prefix="mk-media-")
        cls._media_override = override_settings(MEDIA_ROOT=cls._media_dir)
        cls._media_override.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._media_override.disable()
        shutil.rmtree(cls._media_dir, ignore_errors=True)


class MediaUploadHelperTests(TempMediaRootMixin, TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="orga@test.app",
            password="test-pass-123",
        )
        self.event = Event.objects.create(
            organizer=self.user,
            name="Test",
            event_date=timezone.now() + timedelta(days=30),
            slug=f"test-{self.user.id}",
        )

    def test_save_event_image_writes_jpeg(self):
        relative = save_event_image(self.event.id, _jpeg_file())
        self.assertTrue(relative.startswith(f"events/{self.event.id}/"))
        self.assertTrue(relative.endswith(".jpg"))
        self.assertTrue(default_storage.exists(relative))

    def test_save_event_audio_writes_mp3(self):
        relative = save_event_audio(self.event.id, _mp3_file())
        self.assertTrue(relative.startswith(f"events/{self.event.id}/audio/"))
        self.assertTrue(relative.endswith(".mp3"))
        self.assertTrue(default_storage.exists(relative))

    def test_save_rejects_missing_file(self):
        with self.assertRaises(MediaUploadError):
            save_event_image(self.event.id, None)

    def test_absolute_media_url_keeps_object_storage_url(self):
        """En S3, l’URL signée/publique du stockage est renvoyée telle quelle."""
        request = RequestFactory().get("/")
        remote_url = "https://cdn.example.test/events/1/photo.jpg"
        with patch.object(default_storage, "url", return_value=remote_url):
            self.assertEqual(
                absolute_media_url(request, f"events/{self.event.id}/photo.jpg"),
                remote_url,
            )

    def test_absolute_media_url_prefixes_local_storage_with_public_base(self):
        request = RequestFactory().get("/")
        with override_settings(PUBLIC_BASE_URL="https://api.example.test"):
            url = absolute_media_url(request, f"events/{self.event.id}/photo.jpg")
        self.assertEqual(
            url,
            f"https://api.example.test/media/events/{self.event.id}/photo.jpg",
        )


@override_settings(PUBLIC_BASE_URL="https://api.example.test")
class MediaUploadApiTests(TempMediaRootMixin, TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="orga2@test.app",
            password="test-pass-123",
        )
        self.event = Event.objects.create(
            organizer=self.user,
            name="Upload API",
            event_date=timezone.now() + timedelta(days=30),
            slug=f"upload-{self.user.id}",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_upload_media_returns_absolute_url(self):
        response = self.client.post(
            f"/api/events/{self.event.id}/media/",
            {"file": _jpeg_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        url = response.data["url"]
        self.assertTrue(url.startswith("https://api.example.test/media/events/"))
        self.assertTrue(url.endswith(".jpg"))

    def test_upload_audio_returns_absolute_url(self):
        response = self.client.post(
            f"/api/events/{self.event.id}/media/",
            {"file": _mp3_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        url = response.data["url"]
        self.assertTrue(url.startswith("https://api.example.test/media/events/"))
        self.assertIn("/audio/", url)
        self.assertTrue(url.endswith(".mp3"))

class GuestbookApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="gb@test.app",
            password="test-pass-123",
        )
        self.event = Event.objects.create(
            organizer=self.user,
            name="Guestbook Event",
            status=Event.Status.PUBLISHED,
            event_date=timezone.now() + timedelta(days=30),
            slug="gb-event",
        )
        self.client = APIClient()

    def test_public_create_and_list(self):
        create = self.client.post(
            "/api/inv/gb-event/guestbook/",
            {"message": "Beau mariage !"},
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        self.assertEqual(create.data["author_name"], "Invité")
        self.assertEqual(create.data["message"], "Beau mariage !")

        listed = self.client.get("/api/inv/gb-event/guestbook/")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data), 1)

    def test_organizer_list_and_delete(self):
        entry = GuestbookEntry.objects.create(
            event=self.event,
            author_name="Camille",
            message="Félicitations",
        )
        self.client.force_authenticate(user=self.user)
        listed = self.client.get(f"/api/events/{self.event.id}/guestbook/")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data), 1)

        deleted = self.client.delete(
            f"/api/events/{self.event.id}/guestbook/{entry.id}/",
        )
        self.assertEqual(deleted.status_code, 204)
        self.assertFalse(GuestbookEntry.objects.filter(pk=entry.id).exists())

    def test_public_guestbook_write_is_throttled(self):
        from django.core.cache import cache
        from rest_framework.throttling import SimpleRateThrottle

        cache.clear()
        previous = SimpleRateThrottle.THROTTLE_RATES
        SimpleRateThrottle.THROTTLE_RATES = {
            **previous,
            "public_guestbook_write": "2/min",
        }
        try:
            url = "/api/inv/gb-event/guestbook/"
            first = self.client.post(url, {"message": "Un"}, format="json")
            second = self.client.post(url, {"message": "Deux"}, format="json")
            third = self.client.post(url, {"message": "Trop"}, format="json")
            self.assertEqual(first.status_code, 201)
            self.assertEqual(second.status_code, 201)
            self.assertEqual(third.status_code, 429)
        finally:
            SimpleRateThrottle.THROTTLE_RATES = previous
            cache.clear()


class EventTemplateResolutionTests(TestCase):
    """Le modèle doit être résolu par slug, l'ID restant accepté (legacy)."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="templates@test.app",
            password="test-pass-123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.elegance, _ = InvitationTemplate.objects.get_or_create(
            slug="elegance",
            defaults={"name": "Élégance", "category": "wedding"},
        )
        self.neon, _ = InvitationTemplate.objects.get_or_create(
            slug="neon",
            defaults={"name": "Néon", "category": "wedding"},
        )
        self.payload = {
            "name": "Mariage test",
            "type": Event.Type.WEDDING,
            "event_date": (timezone.now() + timedelta(days=30)).isoformat(),
        }

    def test_create_event_with_template_slug(self):
        response = self.client.post(
            "/api/events/",
            {**self.payload, "template": "neon"},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        event = Event.objects.get(pk=response.data["id"])
        self.assertEqual(event.template_id, self.neon.id)
        self.assertEqual(response.data["template_detail"]["slug"], "neon")

    def test_create_event_with_papeterie_template_slug(self):
        response = self.client.post(
            "/api/events/",
            {**self.payload, "template": "papeterie"},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        event = Event.objects.get(pk=response.data["id"])
        self.assertEqual(event.template.slug, "papeterie")

    def test_create_event_with_olivier_template_slug(self):
        response = self.client.post(
            "/api/events/",
            {**self.payload, "template": "olivier"},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        event = Event.objects.get(pk=response.data["id"])
        self.assertEqual(event.template.slug, "olivier")

    def test_create_event_with_legacy_template_id(self):
        response = self.client.post(
            "/api/events/",
            {**self.payload, "template": self.elegance.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        event = Event.objects.get(pk=response.data["id"])
        self.assertEqual(event.template_id, self.elegance.id)

    def test_patch_event_with_template_slug(self):
        event = Event.objects.create(
            organizer=self.user,
            name="À modifier",
            template=self.elegance,
            event_date=timezone.now() + timedelta(days=30),
            slug="a-modifier",
        )
        response = self.client.patch(
            f"/api/events/{event.id}/",
            {"template": "neon"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        event.refresh_from_db()
        self.assertEqual(event.template_id, self.neon.id)

    def test_unknown_template_slug_is_rejected(self):
        response = self.client.post(
            "/api/events/",
            {**self.payload, "template": "modele-inexistant"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("template", response.data)


class GuestPublishSyncTests(TestCase):
    """Publication idempotente : clé serveur stable + suppressions explicites."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="guests@test.app",
            password="test-pass-123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.event = Event.objects.create(
            organizer=self.user,
            name="Sync invités",
            event_date=timezone.now() + timedelta(days=30),
            slug="sync-invites",
        )

    def _publish(self, **payload):
        return self.client.post(
            f"/api/events/{self.event.id}/publish/",
            {"free_publication": True, **payload},
            format="json",
        )

    def test_new_guest_gets_server_studio_key(self):
        guest = Guest.objects.create(event=self.event, full_name="Alice")
        self.assertTrue(guest.studio_key)
        self.assertTrue(guest.studio_key.startswith("INV-"))

    def test_publish_is_idempotent_with_same_studio_key(self):
        payload = {"guests": [{"studio_key": "INV-STABLE", "full_name": "Alice"}]}
        first = self._publish(**payload)
        second = self._publish(**payload)
        self.assertEqual(first.status_code, 200, first.data)
        self.assertEqual(second.status_code, 200, second.data)
        self.assertEqual(Guest.objects.filter(event=self.event).count(), 1)
        self.assertEqual(Guest.objects.get(event=self.event).studio_key, "INV-STABLE")

    def test_publish_updates_legacy_guest_by_server_id(self):
        guest = Guest.objects.create(event=self.event, full_name="Legacy")
        Guest.objects.filter(pk=guest.pk).update(studio_key=None)

        response = self._publish(
            guests=[
                {
                    "guest_id": guest.pk,
                    "studio_key": "INV-LEGACY",
                    "full_name": "Legacy updated",
                }
            ]
        )
        self.assertEqual(response.status_code, 200, response.data)
        guest.refresh_from_db()
        self.assertEqual(guest.studio_key, "INV-LEGACY")
        self.assertEqual(guest.full_name, "Legacy updated")
        self.assertEqual(Guest.objects.filter(event=self.event).count(), 1)

    def test_publish_deletes_explicitly_removed_guest(self):
        removed = Guest.objects.create(event=self.event, full_name="À retirer")
        kept = Guest.objects.create(event=self.event, full_name="À garder")

        response = self._publish(
            guests=[{"studio_key": kept.studio_key, "full_name": kept.full_name}],
            deleted_guest_keys=[removed.studio_key],
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertFalse(Guest.objects.filter(pk=removed.pk).exists())
        self.assertTrue(Guest.objects.filter(pk=kept.pk).exists())

    def test_publish_does_not_delete_a_submitted_guest(self):
        guest = Guest.objects.create(event=self.event, full_name="Protégé")
        response = self._publish(
            guests=[{"studio_key": guest.studio_key, "full_name": guest.full_name}],
            deleted_guest_keys=[guest.studio_key],
            deleted_guest_ids=[guest.pk],
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(Guest.objects.filter(pk=guest.pk).exists())

    def test_publish_deletes_by_server_id(self):
        guest = Guest.objects.create(event=self.event, full_name="Via id")
        response = self._publish(deleted_guest_ids=[guest.pk])
        self.assertEqual(response.status_code, 200, response.data)
        self.assertFalse(Guest.objects.filter(pk=guest.pk).exists())

    def test_free_publication_keeps_personal_links_disabled(self):
        guest = Guest.objects.create(event=self.event, full_name="Vitrine")
        response = self._publish()
        self.assertEqual(response.status_code, 200, response.data)
        guest.refresh_from_db()
        self.event.refresh_from_db()
        self.assertEqual(self.event.payment_status, "free")
        self.assertFalse(guest.has_personal_link)
        self.assertEqual(
            self.client.get(f"/api/inv/{self.event.slug}/?guest={guest.access_token}").data["guest"],
            None,
        )
        rsvp = self.client.post(
            f"/api/inv/{self.event.slug}/rsvp/",
            {
                "access_token": guest.access_token,
                "answer": "yes",
                "adults_count": 1,
                "children_count": 0,
            },
            format="json",
        )
        self.assertEqual(rsvp.status_code, 404)

    def test_unpaid_draft_cannot_be_published_without_free_choice(self):
        response = self.client.post(
            f"/api/events/{self.event.id}/publish/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, 402)
        self.event.refresh_from_db()
        self.assertEqual(self.event.status, Event.Status.DRAFT)

    def test_event_archive_export_is_private_and_contains_event_data(self):
        guest = Guest.objects.create(
            event=self.event,
            full_name="Alice Export",
            email="alice@example.test",
        )
        response = self.client.get(f"/api/events/{self.event.id}/export/")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["format"], "mk-event-archive")
        self.assertEqual(response.data["guests"][0]["email"], guest.email)

        other = User.objects.create_user(
            email="other-export@test.app",
            password="Strong-Password-892!",
            full_name="Autre organisateur",
        )
        self.client.force_authenticate(user=other)
        denied = self.client.get(f"/api/events/{self.event.id}/export/")
        self.assertEqual(denied.status_code, 404)


class EventDataRetentionTests(TempMediaRootMixin, TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="retention@test.app",
            password="Strong-Password-892!",
            full_name="Alex Rétention",
        )
        self.event = Event.objects.create(
            organizer=self.user,
            name="Événement terminé",
            status=Event.Status.PUBLISHED,
            event_date=timezone.now() - timedelta(days=100),
            retention_notice_sent_at=timezone.now() - timedelta(days=31),
            slug="evenement-termine",
            studio_config={"story": [{"text": "Souvenir"}]},
        )

    def test_purge_exports_then_deletes_event_data_but_keeps_payment_ledger(self):
        admin_user = User.objects.create_user(
            email="retention-admin@test.app",
            password="Strong-Password-892!",
            full_name="Admin de paiement",
            role=User.Role.ADMIN,
        )
        table = Table.objects.create(event=self.event, name="Table 1")
        guest = Guest.objects.create(
            event=self.event,
            full_name="Alice Export",
            email="alice@example.test",
            table=table,
            has_personal_link=True,
        )
        RSVPResponse.objects.create(
            event=self.event,
            guest=guest,
            answer=RSVPResponse.Answer.YES,
            message="À bientôt",
        )
        GuestbookEntry.objects.create(
            event=self.event,
            guest=guest,
            author_name="Alice",
            message="Félicitations !",
        )
        media_path = save_event_image(self.event.id, _jpeg_file())
        payment = EventPayment.objects.create(
            event=self.event,
            external_reference="retention-payment",
            payment_method=EventPayment.Method.MOBILE_MONEY,
            guest_quota=1,
            amount=Decimal("0.50"),
            amount_net=Decimal("0.47"),
            status=EventPayment.Status.SUCCEEDED,
            paid_at=timezone.now(),
        )
        AdminEarning.objects.create(
            user=admin_user,
            payment=payment,
            share_percent=Decimal("10.00"),
            amount=Decimal("0.05"),
            currency="USD",
        )

        with tempfile.TemporaryDirectory(prefix="mk-retention-export-") as export_dir:
            call_command(
                "process_data_retention",
                "--purge",
                "--confirm",
                "--export-dir",
                export_dir,
                stdout=StringIO(),
            )
            archive_path = Path(export_dir) / f"mk-event-{self.event.id}-archive.json"
            archive = json.loads(archive_path.read_text(encoding="utf-8"))
            media_archive_path = (
                Path(export_dir)
                / f"mk-event-{self.event.id}-media"
                / media_path
            )
            self.assertTrue(media_archive_path.exists())

        self.assertEqual(archive["format"], "mk-event-archive")
        self.assertEqual(archive["event"]["name"], "Événement terminé")
        self.assertEqual(archive["guests"][0]["email"], "alice@example.test")
        self.assertEqual(archive["rsvps"][0]["message"], "À bientôt")
        self.assertEqual(archive["guestbook"][0]["message"], "Félicitations !")
        self.assertFalse(Event.objects.filter(pk=self.event.pk).exists())
        self.assertFalse(Guest.objects.filter(pk=guest.pk).exists())
        self.assertFalse(default_storage.exists(media_path))
        payment.refresh_from_db()
        self.assertIsNone(payment.event_id)
        self.assertTrue(AdminEarning.objects.filter(payment=payment).exists())

    def test_purge_waits_for_notice_grace_period_and_pending_payments(self):
        self.event.retention_notice_sent_at = timezone.now() - timedelta(days=29)
        self.event.save(update_fields=["retention_notice_sent_at"])
        self.assertFalse(
            DataRetentionCommand.events_due_for_purge(timezone.now()).filter(
                pk=self.event.pk,
            ).exists()
        )

        self.event.retention_notice_sent_at = timezone.now() - timedelta(days=31)
        self.event.save(update_fields=["retention_notice_sent_at"])
        EventPayment.objects.create(
            event=self.event,
            external_reference="retention-pending",
            payment_method=EventPayment.Method.MOBILE_MONEY,
            guest_quota=1,
            amount=Decimal("0.50"),
            status=EventPayment.Status.PENDING,
        )
        self.assertFalse(
            DataRetentionCommand.events_due_for_purge(timezone.now()).filter(
                pk=self.event.pk,
            ).exists()
        )

    def test_old_financial_rows_are_pruned_without_changing_wallet_balance(self):
        admin_user = User.objects.create_user(
            email="carry@test.app",
            password="Strong-Password-892!",
            full_name="Admin Carry",
            role=User.Role.ADMIN,
        )
        old_payment = EventPayment.objects.create(
            event=self.event,
            external_reference="old-ledger-payment",
            payment_method=EventPayment.Method.MOBILE_MONEY,
            guest_quota=20,
            amount=Decimal("10.00"),
            amount_net=Decimal("9.50"),
            status=EventPayment.Status.SUCCEEDED,
        )
        EventPayment.objects.filter(pk=old_payment.pk).update(
            updated_at=timezone.now() - timedelta(days=366),
        )
        AdminEarning.objects.create(
            user=admin_user,
            payment=old_payment,
            share_percent=Decimal("100.00"),
            amount=Decimal("10.00"),
            currency="USD",
        )
        old_withdrawal = AdminWithdrawal.objects.create(
            user=admin_user,
            external_reference="old-ledger-withdrawal",
            account="+243900000000",
            amount=Decimal("3.00"),
            fee=Decimal("0.03"),
            amount_debited=Decimal("3.03"),
            currency="USD",
            status=AdminWithdrawal.Status.SUCCEEDED,
        )
        AdminWithdrawal.objects.filter(pk=old_withdrawal.pk).update(
            updated_at=timezone.now() - timedelta(days=366),
        )
        AdminWalletCarryForward.objects.create(
            user=admin_user,
            currency="USD",
            balance=Decimal("2.00"),
        )

        removed_count = DataRetentionCommand.purge_financial_ledger(
            timezone.now() - timedelta(days=365),
        )

        self.assertEqual(removed_count, 1)
        self.assertFalse(EventPayment.objects.filter(pk=old_payment.pk).exists())
        self.assertFalse(AdminEarning.objects.filter(user=admin_user).exists())
        self.assertFalse(AdminWithdrawal.objects.filter(pk=old_withdrawal.pk).exists())
        self.assertEqual(
            AdminWalletCarryForward.objects.get(user=admin_user, currency="USD").balance,
            Decimal("8.97"),
        )
        self.assertEqual(_ledger_balance(admin_user.pk, "USD"), Decimal("8.97"))


@override_settings(KIBA_WEBHOOK_SECRET="test-webhook-secret")
class EventPaymentFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="payments@test.app",
            password="test-pass-12345",
        )
        self.event = Event.objects.create(
            organizer=self.user,
            name="Paiement événement",
            event_date=timezone.now() + timedelta(days=30),
            slug="paiement-evenement",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_mobile_money_payment_records_exact_amount_without_granting_quota(self):
        provider_response = Mock(
            ok=True,
            json=Mock(
                return_value={
                    "id": "kiba-payment-1",
                    "reference": "KIBA-REF-1",
                    "status": "PENDING",
                    "amount_net": "2.35",
                    "currency": "USD",
                }
            ),
        )
        with patch.dict(
            "os.environ",
            {"KIBA_PUBLIC_KEY": "pk_test", "KIBA_SECRET_KEY": "sk_test"},
        ), patch("events.views.requests.post", return_value=provider_response) as send:
            response = self.client.post(
                f"/api/events/{self.event.id}/pay/",
                {
                    "guest_quota": 5,
                    "payment_method": "mobile_money",
                    "mobilenumber": "+243900000000",
                },
                format="json",
            )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["amount_due"], "2.50")
        payment = EventPayment.objects.get(event=self.event)
        self.assertEqual(payment.amount, Decimal("2.50"))
        self.assertEqual(payment.amount_net, Decimal("2.35"))
        self.assertEqual(payment.guest_quota, 5)
        self.assertEqual(payment.status, EventPayment.Status.PENDING)
        self.event.refresh_from_db()
        self.assertEqual(self.event.paid_guest_quota, 0)
        self.assertEqual(self.event.amount_paid_total, Decimal("0.00"))
        sent = send.call_args.kwargs["json"]
        self.assertEqual(sent["mobilenumber"], "+243900000000")
        self.assertNotIn("payment_method", sent)
        self.assertEqual(sent["amount"], 2.5)
        self.assertIsInstance(sent["amount"], float)

    def test_mobile_money_requires_a_number(self):
        response = self.client.post(
            f"/api/events/{self.event.id}/pay/",
            {"guest_quota": 1, "payment_method": "mobile_money"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("mobilenumber", response.data)
        self.assertFalse(EventPayment.objects.exists())

    def test_card_payment_contains_a_return_url(self):
        provider_response = Mock(
            ok=True,
            json=Mock(return_value={"id": "kiba-card-1", "status": "PENDING"}),
        )
        with patch.dict(
            "os.environ",
            {"KIBA_PUBLIC_KEY": "pk_test", "KIBA_SECRET_KEY": "sk_test"},
        ), patch("events.views.requests.post", return_value=provider_response) as send:
            response = self.client.post(
                f"/api/events/{self.event.id}/pay/",
                {"guest_quota": 2, "payment_method": "card"},
                format="json",
            )
        self.assertEqual(response.status_code, 201, response.data)
        sent = send.call_args.kwargs["json"]
        self.assertEqual(sent["payment_method"], "card")
        self.assertIn("/pay/success?eventId=", sent["return_url"])

    def test_overlapping_payment_initialization_is_rejected(self):
        provider_response = Mock(
            ok=True,
            json=Mock(return_value={"id": "kiba-payment-2", "status": "PENDING"}),
        )
        nested_responses = []

        def initialize_provider_payment(*args, **kwargs):
            nested_responses.append(
                self.client.post(
                    f"/api/events/{self.event.id}/pay/",
                    {
                        "guest_quota": 3,
                        "payment_method": "mobile_money",
                        "mobilenumber": "+243900000000",
                    },
                    format="json",
                )
            )
            return provider_response

        with patch.dict(
            "os.environ",
            {"KIBA_PUBLIC_KEY": "pk_test", "KIBA_SECRET_KEY": "sk_test"},
        ), patch(
            "events.views.requests.post",
            side_effect=initialize_provider_payment,
        ) as send:
            response = self.client.post(
                f"/api/events/{self.event.id}/pay/",
                {
                    "guest_quota": 2,
                    "payment_method": "mobile_money",
                    "mobilenumber": "+243900000000",
                },
                format="json",
            )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(len(nested_responses), 1)
        self.assertEqual(nested_responses[0].status_code, 409)
        self.assertEqual(send.call_count, 1)
        self.assertEqual(EventPayment.objects.filter(event=self.event).count(), 1)

    def test_card_payment_reports_kibawallet_rejection_reason(self):
        provider_response = Mock(
            ok=False,
            status_code=400,
            json=Mock(return_value={"message": "Card payments are not enabled"}),
        )
        with patch.dict(
            "os.environ",
            {"KIBA_PUBLIC_KEY": "pk_test", "KIBA_SECRET_KEY": "sk_test"},
        ), patch("events.views.requests.post", return_value=provider_response):
            response = self.client.post(
                f"/api/events/{self.event.id}/pay/",
                {"guest_quota": 2, "payment_method": "card"},
                format="json",
            )

        self.assertEqual(response.status_code, 502)
        self.assertIn("HTTP 400", response.data["detail"])
        self.assertIn("Card payments are not enabled", response.data["detail"])
        payment = EventPayment.objects.get(event=self.event)
        self.assertEqual(payment.status, EventPayment.Status.FAILED)
        self.event.refresh_from_db()
        self.assertEqual(self.event.payment_status, "failed")

    def test_signed_webhook_publishes_and_allocates_links_idempotently(self):
        self.user.role = User.Role.ADMIN
        self.user.payout_share_percent = Decimal("25.00")
        self.user.save()
        guests = [
            Guest.objects.create(event=self.event, full_name=f"Invité {index}")
            for index in range(3)
        ]
        payment = EventPayment.objects.create(
            event=self.event,
            external_reference="inv-1-test-batch",
            provider_payment_id="kiba-payment-2",
            payment_method=EventPayment.Method.MOBILE_MONEY,
            guest_quota=2,
            amount=Decimal("1.00"),
        )
        payload = {
            "event": "payment.success",
            "data": {
                "transaction_id": "kiba-payment-2",
                "external_reference": payment.external_reference,
                "amount_gross": "1.00",
                "amount_net": "0.94",
                "currency": "USD",
            },
        }
        raw_body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        signature = hmac.new(
            b"test-webhook-secret",
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        def deliver():
            return self.client.generic(
                "POST",
                "/api/payments/kibawallet/webhook/",
                raw_body,
                content_type="application/json",
                HTTP_X_KIBA_SIGNATURE=signature,
            )

        first = deliver()
        self.assertEqual(first.status_code, 200, first.data)
        second = deliver()
        self.assertEqual(second.status_code, 200, second.data)
        self.event.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(self.event.status, Event.Status.PUBLISHED)
        self.assertEqual(self.event.payment_status, "succeeded")
        self.assertEqual(self.event.paid_guest_quota, 2)
        self.assertEqual(self.event.paid_guest_count, 2)
        self.assertEqual(self.event.amount_paid_total, Decimal("1.00"))
        self.assertEqual(payment.status, EventPayment.Status.SUCCEEDED)
        self.assertEqual(payment.amount_net, Decimal("0.94"))
        earning = AdminEarning.objects.get(user=self.user, payment=payment)
        self.assertEqual(earning.share_percent, Decimal("25.00"))
        self.assertEqual(earning.amount, Decimal("0.23"))
        self.assertEqual(
            [guest.has_personal_link for guest in Guest.objects.filter(pk__in=[g.pk for g in guests]).order_by("id")],
            [True, True, False],
        )

    def test_webhook_rejects_an_invalid_signature(self):
        response = self.client.generic(
            "POST",
            "/api/payments/kibawallet/webhook/",
            b'{"event":"payment.success","data":{}}',
            content_type="application/json",
            HTTP_X_KIBA_SIGNATURE="invalid",
        )
        self.assertEqual(response.status_code, 401)

    def test_status_reports_uncovered_guest_delta(self):
        self.event.status = Event.Status.PUBLISHED
        self.event.paid_guest_quota = 2
        self.event.paid_guest_count = 1
        self.event.save()
        Guest.objects.create(event=self.event, full_name="Couvert", has_personal_link=True)
        Guest.objects.create(event=self.event, full_name="À couvrir")

        response = self.client.get(f"/api/events/{self.event.id}/payment-status/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["pending_count"], 1)
        self.assertEqual(response.data["available_credits"], 1)
        self.assertEqual(response.data["amount_due"], "0.00")


@override_settings(KIBA_WEBHOOK_SECRET="test-webhook-secret")
class AdminWalletTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin-wallet@test.app",
            password="test-password-123",
            full_name="Wallet Admin",
            role=User.Role.ADMIN,
            payout_share_percent=Decimal("25.00"),
        )
        self.other_admin = User.objects.create_user(
            email="other-admin-wallet@test.app",
            password="test-password-123",
            full_name="Other Admin",
            role=User.Role.ADMIN,
            payout_share_percent=Decimal("10.00"),
        )
        self.organizer = User.objects.create_user(
            email="wallet-organizer@test.app",
            password="test-password-123",
            full_name="Organizer",
        )
        self.event = Event.objects.create(
            organizer=self.organizer,
            name="Portefeuille test",
            event_date=timezone.now() + timedelta(days=30),
            slug="portefeuille-test",
        )
        self.payment = EventPayment.objects.create(
            event=self.event,
            external_reference="inv-wallet-earned",
            provider_payment_id="kiba-wallet-earned",
            payment_method=EventPayment.Method.MOBILE_MONEY,
            guest_quota=2,
            amount=Decimal("1.00"),
            amount_net=Decimal("0.94"),
            status=EventPayment.Status.SUCCEEDED,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_dashboard_only_exposes_the_current_admin_transactions(self):
        own_earning = AdminEarning.objects.create(
            user=self.admin,
            payment=self.payment,
            share_percent=Decimal("25.00"),
            amount=Decimal("5.00"),
            currency="USD",
        )
        other_payment = EventPayment.objects.create(
            event=self.event,
            external_reference="inv-other-admin",
            payment_method=EventPayment.Method.CARD,
            guest_quota=1,
            amount=Decimal("0.50"),
            amount_net=Decimal("0.47"),
            status=EventPayment.Status.SUCCEEDED,
        )
        AdminEarning.objects.create(
            user=self.other_admin,
            payment=other_payment,
            share_percent=Decimal("10.00"),
            amount=Decimal("2.00"),
            currency="USD",
        )

        response = self.client.get("/api/admin/wallet/")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["balances"]["USD"], "5.00")
        self.assertEqual(
            [item["id"] for item in response.data["transactions"]],
            [f"earning-{own_earning.id}"],
        )
        self.assertEqual(response.data["admin_balances"], [])

    def test_organizer_cannot_open_admin_wallet(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get("/api/admin/wallet/")
        self.assertEqual(response.status_code, 403)

    def test_superuser_can_see_global_balances_and_transactions(self):
        superuser = User.objects.create_superuser(
            email="root-wallet@test.app",
            password="test-password-123",
        )
        AdminEarning.objects.create(
            user=self.admin,
            payment=self.payment,
            share_percent=Decimal("25.00"),
            amount=Decimal("5.00"),
            currency="USD",
        )
        self.client.force_authenticate(user=superuser)

        response = self.client.get("/api/admin/wallet/")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data["is_superuser"])
        self.assertEqual(len(response.data["transactions"]), 2)
        self.assertEqual(
            {item["type"] for item in response.data["transactions"]},
            {"earning", "incoming_payment"},
        )
        self.assertEqual(len(response.data["admin_balances"]), 3)

    def test_admin_share_configuration_cannot_exceed_one_hundred_percent(self):
        self.other_admin.payout_share_percent = Decimal("76.00")
        with self.assertRaises(ValidationError):
            self.other_admin.full_clean()

    def test_withdrawal_reserves_the_amount_and_uses_kibawallet(self):
        AdminEarning.objects.create(
            user=self.admin,
            payment=self.payment,
            share_percent=Decimal("25.00"),
            amount=Decimal("10.00"),
            currency="USD",
        )
        wallet_response = Mock(ok=True, json=Mock(return_value={"balance": "100.00"}))
        payout_response = Mock(
            ok=True,
            json=Mock(
                return_value={
                    "id": "kiba-withdrawal-1",
                    "reference": "KIBA-WITHDRAW-1",
                    "status": "PENDING",
                    "fee_withdrawal": "0.05",
                    "amount_debited": "5.05",
                }
            ),
        )
        with patch.dict(
            "os.environ",
            {"KIBA_PUBLIC_KEY": "pk_test", "KIBA_SECRET_KEY": "sk_test"},
        ), patch(
            "events.payouts.requests.get",
            return_value=wallet_response,
        ) as get_wallet, patch(
            "events.payouts.requests.post",
            return_value=payout_response,
        ) as send:
            response = self.client.post(
                "/api/admin/wallet/withdrawals/",
                {"amount": "5.00", "currency": "USD", "account": "+243900000000"},
                format="json",
            )

        self.assertEqual(response.status_code, 201, response.data)
        withdrawal = AdminWithdrawal.objects.get(user=self.admin)
        self.assertEqual(withdrawal.status, AdminWithdrawal.Status.PENDING)
        self.assertEqual(withdrawal.amount_debited, Decimal("5.05"))
        self.assertEqual(send.call_args.kwargs["json"]["amount"], 5.0)
        self.assertEqual(send.call_args.kwargs["json"]["currency"], "USD")
        self.assertEqual(
            get_wallet.call_args.kwargs["headers"]["Authorization"],
            "Bearer sk_test",
        )

    def test_withdrawal_cannot_exceed_earned_balance_including_fee(self):
        AdminEarning.objects.create(
            user=self.admin,
            payment=self.payment,
            share_percent=Decimal("25.00"),
            amount=Decimal("1.00"),
            currency="USD",
        )
        with patch("events.payouts.requests.get") as get_wallet:
            response = self.client.post(
                "/api/admin/wallet/withdrawals/",
                {"amount": "1.00", "currency": "USD", "account": "+243900000000"},
                format="json",
            )
        self.assertEqual(response.status_code, 400)
        get_wallet.assert_not_called()
        self.assertFalse(AdminWithdrawal.objects.exists())

    def test_withdrawal_webhook_confirms_pending_withdrawal_idempotently(self):
        withdrawal = AdminWithdrawal.objects.create(
            user=self.admin,
            external_reference="mkp-test-withdraw",
            provider_withdrawal_id="kiba-withdrawal-2",
            account="+243900000000",
            amount=Decimal("5.00"),
            fee=Decimal("0.05"),
            amount_debited=Decimal("5.05"),
            currency="USD",
        )
        payload = {
            "event": "withdrawal.success",
            "data": {
                "withdrawal_id": "kiba-withdrawal-2",
                "external_reference": withdrawal.external_reference,
                "amount": "5.00",
                "currency": "USD",
            },
        }
        raw_body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        signature = hmac.new(
            b"test-webhook-secret",
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        response = self.client.generic(
            "POST",
            "/api/payments/kibawallet/webhook/",
            raw_body,
            content_type="application/json",
            HTTP_X_KIBA_SIGNATURE=signature,
        )

        self.assertEqual(response.status_code, 200, response.data)
        withdrawal.refresh_from_db()
        self.assertEqual(withdrawal.status, AdminWithdrawal.Status.SUCCEEDED)
        self.assertIsNotNone(withdrawal.completed_at)

    def test_failed_withdrawal_webhook_releases_reserved_admin_balance(self):
        AdminEarning.objects.create(
            user=self.admin,
            payment=self.payment,
            share_percent=Decimal("25.00"),
            amount=Decimal("10.00"),
            currency="USD",
        )
        withdrawal = AdminWithdrawal.objects.create(
            user=self.admin,
            external_reference="mkp-test-failed-withdraw",
            provider_withdrawal_id="kiba-withdrawal-failed",
            account="+243900000000",
            amount=Decimal("5.00"),
            fee=Decimal("0.05"),
            amount_debited=Decimal("5.05"),
            currency="USD",
        )
        payload = {
            "event": "withdrawal.failed",
            "data": {
                "withdrawal_id": "kiba-withdrawal-failed",
                "external_reference": withdrawal.external_reference,
                "amount": "5.00",
                "currency": "USD",
            },
        }
        raw_body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        signature = hmac.new(
            b"test-webhook-secret",
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        response = self.client.generic(
            "POST",
            "/api/payments/kibawallet/webhook/",
            raw_body,
            content_type="application/json",
            HTTP_X_KIBA_SIGNATURE=signature,
        )

        self.assertEqual(response.status_code, 200, response.data)
        withdrawal.refresh_from_db()
        self.assertEqual(withdrawal.status, AdminWithdrawal.Status.FAILED)
        dashboard = self.client.get("/api/admin/wallet/")
        self.assertEqual(dashboard.data["balances"]["USD"], "10.00")
