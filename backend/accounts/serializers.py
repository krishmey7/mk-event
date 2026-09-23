from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
password_reset_token = PasswordResetTokenGenerator()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "phone",
            "full_name",
            "avatar_url",
            "role",
            "is_active",
            "date_joined",
        )
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=160)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Cet e-mail existe déjà.")
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"].strip(),
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["identifier"].strip()
        password = attrs["password"]
        user = (
            User.objects.filter(Q(email__iexact=identifier) | Q(phone=identifier))
            .distinct()
            .first()
        )
        if user is None or not user.check_password(password):
            raise AuthenticationFailed(
                "Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe."
            )
        if not user.is_active:
            raise AuthenticationFailed("Compte désactivé.")
        attrs["user"] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        validate_password(attrs["password"])

        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise serializers.ValidationError(
                {"uid": "Lien de réinitialisation invalide."}
            ) from exc

        if not password_reset_token.check_token(user, attrs["token"]):
            raise serializers.ValidationError(
                {"token": "Ce lien a expiré ou a déjà été utilisé."}
            )

        attrs["user"] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()


def encode_uid(user) -> str:
    return urlsafe_base64_encode(force_bytes(user.pk))


def make_reset_token(user) -> str:
    return password_reset_token.make_token(user)


def build_auth_session(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "user": UserSerializer(user).data,
        "tokens": {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
    }
