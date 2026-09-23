"""Upload d’images événement — fichiers sur MEDIA_ROOT (volume Railway)."""

from __future__ import annotations

import uuid
from io import BytesIO
from pathlib import Path

from django.conf import settings
from PIL import Image, UnidentifiedImageError

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_EDGE = 1600
JPEG_QUALITY = 82


class MediaUploadError(ValueError):
    pass


def save_event_image(event_id: int, uploaded_file) -> str:
    """
    Convertit l’image en JPEG, l’écrit sous MEDIA_ROOT/events/{id}/…,
    retourne le chemin relatif URL (ex. events/12/abc.jpg).
    """
    if not uploaded_file:
        raise MediaUploadError("Fichier manquant.")

    content_type = (getattr(uploaded_file, "content_type", None) or "").lower()
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise MediaUploadError("Format non supporté (JPEG, PNG ou WebP).")

    size = getattr(uploaded_file, "size", None)
    if size is not None and size > MAX_UPLOAD_BYTES:
        raise MediaUploadError("Image trop lourde (max 8 Mo).")

    raw = uploaded_file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise MediaUploadError("Image trop lourde (max 8 Mo).")

    try:
        image = Image.open(BytesIO(raw))
        image.load()
    except UnidentifiedImageError as exc:
        raise MediaUploadError("Fichier image invalide.") from exc

    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
    elif image.mode != "RGB":
        image = image.convert("RGB")

    w, h = image.size
    scale = min(1.0, MAX_EDGE / max(w, h))
    if scale < 1.0:
        image = image.resize(
            (max(1, round(w * scale)), max(1, round(h * scale))),
            Image.Resampling.LANCZOS,
        )

    relative_dir = Path("events") / str(event_id)
    dest_dir = Path(settings.MEDIA_ROOT) / relative_dir
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    dest_path = dest_dir / filename
    image.save(dest_path, format="JPEG", quality=JPEG_QUALITY, optimize=True)

    return f"{relative_dir.as_posix()}/{filename}"


def absolute_media_url(request, relative_path: str) -> str:
    """URL absolue publique pour un fichier média."""
    media_url = settings.MEDIA_URL.rstrip("/")
    path = f"{media_url}/{relative_path.lstrip('/')}"
    public = getattr(settings, "PUBLIC_BASE_URL", "").rstrip("/")
    if public:
        return f"{public}{path}"
    return request.build_absolute_uri(path)
