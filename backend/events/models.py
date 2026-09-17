import secrets
import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class InvitationTemplate(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=32, default="wedding")
    thumbnail_url = models.URLField(blank=True, default="")
    preview_url = models.URLField(blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Event(models.Model):
    class Type(models.TextChoices):
        WEDDING = "wedding", "Mariage"
        BIRTHDAY = "birthday", "Anniversaire"
        BAPTISM = "baptism", "Baptême"
        CORPORATE = "corporate", "Événement pro"
        OTHER = "other", "Autre"

    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PUBLISHED = "published", "Publiée"
        ARCHIVED = "archived", "Archivée"

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
    )
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=32, choices=Type.choices, default=Type.WEDDING)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    template = models.ForeignKey(
        InvitationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    event_date = models.DateTimeField()
    venue_name = models.CharField(max_length=200, blank=True, default="")
    venue_city = models.CharField(max_length=120, blank=True, default="")
    message = models.TextField(blank=True, null=True)
    slug = models.SlugField(unique=True, max_length=220)
    qr_code_url = models.URLField(blank=True, null=True)
    cover_image_url = models.URLField(blank=True, null=True)
    theme_key = models.CharField(
        max_length=40,
        blank=True,
        default="",
        help_text="Clé de palette choisie à la création (ex. sauge, champagne).",
    )
    studio_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Snapshot studio (cover, story, programme, galerie, thème…) servi à l’invité.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-event_date", "-created_at"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "invitation"
            candidate = base
            while Event.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{uuid.uuid4().hex[:6]}"
            self.slug = candidate
        super().save(*args, **kwargs)


class Table(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="tables")
    name = models.CharField(max_length=120)
    seats = models.PositiveIntegerField(default=8)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["id"]
        unique_together = ("event", "name")

    def __str__(self) -> str:
        return f"{self.event_id} · {self.name}"

    @property
    def seats_taken(self) -> int:
        return sum(
            guest.adults_count + guest.children_count
            for guest in self.guests.all()
            if guest.rsvp_status != Guest.RsvpStatus.DECLINED
        )


class Guest(models.Model):
    class RsvpStatus(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmé"
        PENDING = "pending", "En attente"
        MAYBE = "maybe", "Peut-être"
        DECLINED = "declined", "Refusé"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="guests")
    full_name = models.CharField(max_length=160)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)
    rsvp_status = models.CharField(
        max_length=20,
        choices=RsvpStatus.choices,
        default=RsvpStatus.PENDING,
    )
    adults_count = models.PositiveIntegerField(default=1)
    children_count = models.PositiveIntegerField(default=0)
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="guests",
    )
    drink = models.CharField(max_length=80, blank=True, null=True)
    access_token = models.CharField(max_length=64, unique=True, editable=False)
    # Clé studio (INV-1234) pour synchroniser la publication.
    studio_key = models.CharField(max_length=64, blank=True, null=True)
    checked_in = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(blank=True, null=True)
    responded_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["event", "studio_key"],
                name="uniq_guest_studio_key_per_event",
                condition=models.Q(studio_key__isnull=False) & ~models.Q(studio_key=""),
            ),
        ]

    def __str__(self) -> str:
        return self.full_name

    def save(self, *args, **kwargs):
        if not self.access_token:
            self.access_token = secrets.token_urlsafe(24)
        super().save(*args, **kwargs)

    @property
    def seats(self) -> int:
        return max(1, self.adults_count + self.children_count)


class RSVPResponse(models.Model):
    class Answer(models.TextChoices):
        YES = "yes", "Oui"
        NO = "no", "Non"
        MAYBE = "maybe", "Peut-être"

    guest = models.OneToOneField(Guest, on_delete=models.CASCADE, related_name="rsvp")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvps")
    answer = models.CharField(max_length=10, choices=Answer.choices)
    adults_count = models.PositiveIntegerField(default=1)
    children_count = models.PositiveIntegerField(default=0)
    message = models.TextField(blank=True, null=True)
    responded_at = models.DateTimeField(auto_now=True)

    ANSWER_TO_STATUS = {
        Answer.YES: Guest.RsvpStatus.CONFIRMED,
        Answer.NO: Guest.RsvpStatus.DECLINED,
        Answer.MAYBE: Guest.RsvpStatus.MAYBE,
    }

    def __str__(self) -> str:
        return f"{self.guest_id} → {self.answer}"
