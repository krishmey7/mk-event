"""Envoi d’e-mails via Resend (HTTP). Fallback console si pas de clé."""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


def send_email(*, to: str, subject: str, text: str, html: str | None = None) -> bool:
    """
    Envoie un e-mail. Retourne True si envoyé (ou loggé en mode sans clé).
    Ne lève pas pour un échec réseau — log seulement.
    """
    api_key = getattr(settings, "RESEND_API_KEY", "") or ""
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "MK Events <onboarding@resend.dev>")

    if not api_key:
        logger.warning(
            "RESEND_API_KEY absent — e-mail non envoyé.\nTo: %s\nSubject: %s\n\n%s",
            to,
            subject,
            text,
        )
        return True

    payload: dict = {
        "from": from_email,
        "to": [to],
        "subject": subject,
        "text": text,
    }
    if html:
        payload["html"] = html

    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            if response.status >= 400:
                logger.error("Resend HTTP %s: %s", response.status, response.read())
                return False
            return True
    except urllib.error.HTTPError as exc:
        logger.error("Resend HTTPError %s: %s", exc.code, exc.read())
        return False
    except Exception:
        logger.exception("Échec envoi Resend")
        return False


def send_password_reset_email(*, to: str, reset_url: str, full_name: str) -> bool:
    subject = "Réinitialisez votre mot de passe MK Events"
    greeting = full_name.strip() or "Bonjour"
    text = (
        f"{greeting},\n\n"
        "Vous avez demandé à réinitialiser votre mot de passe MK Events.\n"
        f"Ouvrez ce lien (valide quelques heures) :\n{reset_url}\n\n"
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.\n\n"
        "— L’équipe MK Events"
    )
    html = f"""\
<p>{greeting},</p>
<p>Vous avez demandé à réinitialiser votre mot de passe MK Events.</p>
<p><a href="{reset_url}" style="display:inline-block;padding:12px 18px;background:#E07A5F;color:#2A1F24;text-decoration:none;border-radius:12px;font-weight:600;">
Choisir un nouveau mot de passe
</a></p>
<p style="color:#6B5560;font-size:13px;">Ou copiez ce lien :<br/>{reset_url}</p>
<p style="color:#6B5560;font-size:13px;">Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p>
<p>— L’équipe MK Events</p>
"""
    return send_email(to=to, subject=subject, text=text, html=html)
