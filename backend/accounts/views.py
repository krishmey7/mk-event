from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .email import send_password_reset_email
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
    build_auth_session,
    encode_uid,
    make_reset_token,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(build_auth_session(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(build_auth_session(serializer.validated_data["user"]))


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """Toujours 200 — ne révèle pas si l’e-mail existe."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        if user is not None and user.is_active:
            uid = encode_uid(user)
            token = make_reset_token(user)
            frontend = getattr(settings, "FRONTEND_URL", "https://mk-event-five.vercel.app").rstrip(
                "/"
            )
            reset_url = f"{frontend}/reset-password?uid={uid}&token={token}"
            send_password_reset_email(
                to=user.email,
                reset_url=reset_url,
                full_name=user.full_name or "",
            )
        return Response(
            {
                "detail": (
                    "Si un compte existe pour cet e-mail, un lien de réinitialisation "
                    "vient d’être envoyé."
                )
            }
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Mot de passe mis à jour. Vous pouvez vous connecter."})


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data["id_token"]

        client_ids = [
            cid.strip()
            for cid in getattr(settings, "GOOGLE_OAUTH_CLIENT_IDS", "").split(",")
            if cid.strip()
        ]
        if not client_ids:
            return Response(
                {"detail": "Connexion Google non configurée sur le serveur."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token as google_id_token

            info = None
            for client_id in client_ids:
                try:
                    info = google_id_token.verify_oauth2_token(
                        id_token,
                        google_requests.Request(),
                        audience=client_id,
                    )
                    break
                except ValueError:
                    continue
            if info is None:
                raise ValueError("Jeton Google non vérifié.")
            if info.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
                raise ValueError("Émetteur Google invalide.")
        except Exception:
            return Response(
                {"detail": "Jeton Google invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = (info.get("email") or "").strip().lower()
        if not email or not info.get("email_verified", False):
            return Response(
                {"detail": "L’e-mail Google n’est pas vérifié."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_name = (info.get("name") or "").strip() or email.split("@")[0]
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            # password=None → set_password(None) → mot de passe inutilisable
            user = User.objects.create_user(
                email=email,
                full_name=full_name,
                password=None,
            )
        elif not user.is_active:
            return Response(
                {"detail": "Compte désactivé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        avatar = info.get("picture")
        if avatar and not user.avatar_url and len(avatar) <= 200:
            user.avatar_url = avatar
            user.save(update_fields=["avatar_url"])

        return Response(build_auth_session(user))
