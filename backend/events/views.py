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
from .models import Event, Guest, GuestbookEntry, RSVPResponse, Table, make_studio_key
from .serializers import (
    EventDraftSerializer,
    EventSerializer,
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

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        """Publie l’événement (+ slug optionnel + sync invités studio)."""
        from django.db import IntegrityError
        from django.utils.text import slugify

        event = self.get_object()
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

        event.status = Event.Status.PUBLISHED
        update_fields = ["slug", "status", "updated_at"]
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
        event = annotate_events(Event.objects.filter(pk=event.pk)).get()
        return Response(
            {
                "event": EventSerializer(event).data,
                "guests": synced_guests,
            }
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
            if guest:
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
        if guest is None:
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
