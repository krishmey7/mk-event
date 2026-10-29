"""Upload d’images / audio événement — disque local ou stockage objet S3."""

from __future__ import annotations

import uuid
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image, UnidentifiedImageError

ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
ALLOWED_AUDIO_CONTENT_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/m4a",
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
}
AUDIO_EXTENSIONS = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/m4a": ".m4a",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/aac": ".aac",
}
# Compat anciens imports
ALLOWED_CONTENT_TYPES = ALLOWED_IMAGE_CONTENT_TYPES
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_AUDIO_UPLOAD_BYTES = 15 * 1024 * 1024
MAX_EDGE = 1600
JPEG_QUALITY = 82


class MediaUploadError(ValueError):
    pass


def save_event_image(event_id: int, uploaded_file) -> str:
    """
    Convertit l’image en JPEG puis l’enregistre dans le stockage média
    (`events/{id}/…`), via `default_storage` (local ou S3-compatible).
    Retourne le nom relatif du fichier.
    """
    if not uploaded_file:
        raise MediaUploadError("Fichier manquant.")

    content_type = (getattr(uploaded_file, "content_type", None) or "").lower()
    if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
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

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    relative_name = f"events/{event_id}/{uuid.uuid4().hex}.jpg"
    return default_storage.save(relative_name, ContentFile(buffer.getvalue()))


def save_event_audio(event_id: int, uploaded_file) -> str:
    """
    Enregistre un fichier audio dans le stockage média (`events/{id}/audio/…`).
    Retourne le nom relatif du fichier.
    """
    if not uploaded_file:
        raise MediaUploadError("Fichier manquant.")

    content_type = (getattr(uploaded_file, "content_type", None) or "").lower()
    name = (getattr(uploaded_file, "name", None) or "").lower()
    if content_type and content_type not in ALLOWED_AUDIO_CONTENT_TYPES:
        # Certains navigateurs envoient application/octet-stream — on tente via l’extension.
        if content_type not in {"application/octet-stream", ""}:
            raise MediaUploadError("Format audio non supporté (MP3, M4A, WAV…).")
        if not name.endswith((".mp3", ".m4a", ".wav", ".aac", ".ogg", ".webm")):
            raise MediaUploadError("Format audio non supporté (MP3, M4A, WAV…).")

    size = getattr(uploaded_file, "size", None)
    if size is not None and size > MAX_AUDIO_UPLOAD_BYTES:
        raise MediaUploadError("Audio trop lourd (max 15 Mo).")

    raw = uploaded_file.read()
    if len(raw) > MAX_AUDIO_UPLOAD_BYTES:
        raise MediaUploadError("Audio trop lourd (max 15 Mo).")
    if not raw:
        raise MediaUploadError("Fichier audio vide.")

    ext = AUDIO_EXTENSIONS.get(content_type)
    if not ext:
        for candidate, value in (
            (".mp3", ".mp3"),
            (".m4a", ".m4a"),
            (".wav", ".wav"),
            (".aac", ".aac"),
            (".ogg", ".ogg"),
            (".webm", ".webm"),
        ):
            if name.endswith(candidate):
                ext = value
                break
        else:
            ext = ".mp3"

    relative_name = f"events/{event_id}/audio/{uuid.uuid4().hex}{ext}"
    return default_storage.save(relative_name, ContentFile(raw))


def save_event_media(event_id: int, uploaded_file) -> str:
    """Route image ou audio selon le content-type / nom de fichier."""
    content_type = (getattr(uploaded_file, "content_type", None) or "").lower()
    name = (getattr(uploaded_file, "name", None) or "").lower()
    is_audio = content_type.startswith("audio/") or name.endswith(
        (".mp3", ".m4a", ".wav", ".aac", ".ogg", ".webm")
    )
    if is_audio:
        return save_event_audio(event_id, uploaded_file)
    return save_event_image(event_id, uploaded_file)


def absolute_media_url(request, relative_path: str) -> str:
    """URL publique absolue pour un fichier média (S3 ou stockage local)."""
    url = default_storage.url(relative_path)
    if url.startswith(("http://", "https://", "//")):
        return url
    public = getattr(settings, "PUBLIC_BASE_URL", "").rstrip("/")
    if public:
        return f"{public}/{url.lstrip('/')}"
    return request.build_absolute_uri(url)
