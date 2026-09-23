from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve


def api_home(_request):
    """Page racine — l’API vit sous /api/, pas sur /."""
    return JsonResponse(
        {
            "name": "MK Events API",
            "status": "ok",
            "docs": {
                "login": "POST /api/auth/login/",
                "register": "POST /api/auth/register/",
                "password_reset": "POST /api/auth/password-reset/",
                "google": "POST /api/auth/google/",
                "events": "GET /api/events/ (JWT)",
                "media_upload": "POST /api/events/{id}/media/ (JWT multipart)",
                "public_invite": "GET /api/inv/{slug}/",
                "admin": "/admin/",
            },
            "frontend": "Lancer Expo (npm start) — pas cette URL pour l’app.",
        }
    )


urlpatterns = [
    path("", api_home, name="api-home"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("events.urls")),
    # Médias publics (pages invité) — aussi hors DEBUG (volume Railway).
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]
