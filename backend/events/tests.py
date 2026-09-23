from datetime import timedelta
from io import BytesIO

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from events.media_upload import MediaUploadError, save_event_image
from events.models import Event, GuestbookEntry


User = get_user_model()


def _jpeg_file(name="photo.jpg", size=(80, 60)):
    buffer = BytesIO()
    Image.new("RGB", size, color=(200, 120, 80)).save(buffer, format="JPEG")
    buffer.seek(0)
    buffer.name = name
    buffer.content_type = "image/jpeg"
    return buffer


class MediaUploadHelperTests(TestCase):
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

    def test_save_rejects_missing_file(self):
        with self.assertRaises(MediaUploadError):
            save_event_image(self.event.id, None)


@override_settings(PUBLIC_BASE_URL="https://api.example.test")
class MediaUploadApiTests(TestCase):
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
