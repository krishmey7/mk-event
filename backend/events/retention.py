import shutil
from pathlib import Path, PurePosixPath

from django.core.files.storage import default_storage
from django.utils import timezone

from .models import (
    Event,
    EventPayment,
    Guest,
    GuestbookEntry,
    Table,
)
from .serializers import (
    EventSerializer,
    GuestSerializer,
    GuestbookEntrySerializer,
    TableSerializer,
)


def build_event_archive(event: Event) -> dict:
    return {
        "format": "mk-event-archive",
        "version": 1,
        "exported_at": timezone.now().isoformat(),
        "event": EventSerializer(event).data,
        "guests": GuestSerializer(
            Guest.objects.filter(event=event).select_related("table"),
            many=True,
        ).data,
        "tables": TableSerializer(
            Table.objects.filter(event=event).prefetch_related("guests"),
            many=True,
        ).data,
        "rsvps": list(
            event.rsvps.order_by("id").values(
                "id",
                "guest_id",
                "answer",
                "adults_count",
                "children_count",
                "message",
                "responded_at",
            )
        ),
        "guestbook": GuestbookEntrySerializer(
            event.guestbook_entries.order_by("id"),
            many=True,
        ).data,
        "payments": list(
            event.payments.order_by("created_at").values(
                "external_reference",
                "provider_payment_id",
                "payment_method",
                "guest_quota",
                "amount",
                "amount_net",
                "currency",
                "status",
                "paid_at",
                "created_at",
            )
        ),
        "media_files": list_event_media(event.pk),
    }


def list_event_media(event_id: int) -> list[str]:
    def files_below(path: str) -> list[str]:
        try:
            directories, files = default_storage.listdir(path)
        except FileNotFoundError:
            return []
        found = [f"{path}/{name}" for name in files]
        for directory in directories:
            found.extend(files_below(f"{path}/{directory}"))
        return found

    return files_below(f"events/{event_id}")


def export_event_media(event_id: int, export_dir: Path) -> list[str]:
    exported = []
    for name in list_event_media(event_id):
        relative = PurePosixPath(name)
        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError(f"Chemin média invalide pour l’événement {event_id}.")
        destination = export_dir.joinpath(*relative.parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        with default_storage.open(name, "rb") as source, destination.open("xb") as target:
            shutil.copyfileobj(source, target)
        exported.append(relative.as_posix())
    return exported


def delete_event_media(event_id: int) -> None:
    for name in list_event_media(event_id):
        default_storage.delete(name)


def has_pending_payments(event: Event) -> bool:
    return event.payments.filter(status=EventPayment.Status.PENDING).exists()
