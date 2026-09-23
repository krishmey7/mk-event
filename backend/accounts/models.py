from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("L’e-mail est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("full_name", "Admin")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Le superutilisateur doit avoir is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Le superutilisateur doit avoir is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Organisateur MK Events — connexion e-mail (ou téléphone)."""

    class Role(models.TextChoices):
        ORGANIZER = "organizer", "Organisateur"
        ADMIN = "admin", "Admin"

    username = None
    email = models.EmailField("e-mail", unique=True)
    phone = models.CharField(max_length=32, blank=True, null=True, unique=True)
    full_name = models.CharField(max_length=160)
    avatar_url = models.URLField(blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ORGANIZER,
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.full_name or self.email
