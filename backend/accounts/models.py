from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, Sum


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
    payout_share_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Part des revenus nets KibaWallet attribuée à cet administrateur.",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["email"]

    def clean(self):
        super().clean()
        is_eligible = self.is_superuser or self.role == self.Role.ADMIN
        if not is_eligible and self.payout_share_percent:
            raise ValidationError(
                {"payout_share_percent": "Seuls les administrateurs peuvent recevoir une part."}
            )
        if not is_eligible or not self.payout_share_percent:
            return

        eligible_users = self.__class__.objects.filter(
            Q(is_superuser=True) | Q(role=self.Role.ADMIN),
        ).exclude(pk=self.pk)
        other_percent = eligible_users.aggregate(
            total=Sum("payout_share_percent"),
        )["total"] or 0
        if other_percent + self.payout_share_percent > 100:
            raise ValidationError(
                {"payout_share_percent": "La somme des parts administrateur ne peut pas dépasser 100 %."}
            )

    def __str__(self) -> str:
        return self.full_name or self.email
