from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .serializers import encode_uid, make_reset_token

User = get_user_model()


class AccountApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registration_creates_an_organizer_and_returns_tokens(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "  Alex Organisateur  ",
                "email": "ALEX@EXAMPLE.TEST",
                "password": "Strong-Password-892!",
                "password_confirm": "Strong-Password-892!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(email="alex@example.test")
        self.assertEqual(user.full_name, "Alex Organisateur")
        self.assertEqual(user.role, User.Role.ORGANIZER)
        self.assertNotEqual(user.password, "Strong-Password-892!")
        self.assertTrue(response.data["tokens"]["access"])
        self.assertTrue(response.data["tokens"]["refresh"])

    def test_login_accepts_case_insensitive_email_and_phone(self):
        user = User.objects.create_user(
            email="login@example.test",
            password="Strong-Password-892!",
            full_name="Alex Login",
            phone="+243900000001",
        )

        for identifier in ("LOGIN@example.test", user.phone):
            with self.subTest(identifier=identifier):
                response = self.client.post(
                    "/api/auth/login/",
                    {
                        "identifier": identifier,
                        "password": "Strong-Password-892!",
                    },
                    format="json",
                )
                self.assertEqual(response.status_code, 200, response.data)
                self.assertEqual(response.data["user"]["id"], user.id)
                self.assertTrue(response.data["tokens"]["access"])

    @patch("accounts.views.send_password_reset_email", return_value=True)
    def test_password_reset_request_does_not_disclose_unknown_accounts(self, send_email):
        User.objects.create_user(
            email="reset@example.test",
            password="Strong-Password-892!",
            full_name="Alex Reset",
        )

        known = self.client.post(
            "/api/auth/password-reset/",
            {"email": "reset@example.test"},
            format="json",
        )
        unknown = self.client.post(
            "/api/auth/password-reset/",
            {"email": "unknown@example.test"},
            format="json",
        )

        self.assertEqual(known.status_code, 200)
        self.assertEqual(unknown.status_code, 200)
        self.assertEqual(known.data, unknown.data)
        send_email.assert_called_once()

    def test_password_reset_confirmation_changes_password_and_invalidates_token(self):
        user = User.objects.create_user(
            email="reset-confirm@example.test",
            password="Old-Strong-932!",
            full_name="Alex Reset",
        )
        reset_payload = {
            "uid": encode_uid(user),
            "token": make_reset_token(user),
            "password": "New-Strong-746!",
            "password_confirm": "New-Strong-746!",
        }

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            reset_payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        user.refresh_from_db()
        self.assertTrue(user.check_password("New-Strong-746!"))

        replay = self.client.post(
            "/api/auth/password-reset/confirm/",
            reset_payload,
            format="json",
        )
        self.assertEqual(replay.status_code, 400)
