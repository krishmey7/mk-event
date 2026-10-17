"""Upload d’images / audio événement — fichiers sur MEDIA_ROOT (volume Railway)."""

from __future__ import annotations

import uuid
from io import BytesIO
from pathlib import Path

from django.conf import settings
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
    Convertit l’image en JPEG, l’écrit sous MEDIA_ROOT/events/{id}/…,
    retourne le chemin relatif URL (ex. events/12/abc.jpg).
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

    relative_dir = Path("events") / str(event_id)
    dest_dir = Path(settings.MEDIA_ROOT) / relative_dir
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    dest_path = dest_dir / filename
    image.save(dest_path, format="JPEG", quality=JPEG_QUALITY, optimize=True)

    return f"{relative_dir.as_posix()}/{filename}"


def save_event_audio(event_id: int, uploaded_file) -> str:
    """
    Enregistre un fichier audio sous MEDIA_ROOT/events/{id}/audio/…
    Retourne le chemin relatif URL.
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

    relative_dir = Path("events") / str(event_id) / "audio"
    dest_dir = Path(settings.MEDIA_ROOT) / relative_dir
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = dest_dir / filename
    dest_path.write_bytes(raw)

    return f"{relative_dir.as_posix()}/{filename}"


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
    """URL absolue publique pour un fichier média."""
    media_url = settings.MEDIA_URL.rstrip("/")
    path = f"{media_url}/{relative_path.lstrip('/')}"
    public = getattr(settings, "PUBLIC_BASE_URL", "").rstrip("/")
    if public:
        return f"{public}{path}"
    return request.build_absolute_uri(path)
