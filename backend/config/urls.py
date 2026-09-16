from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.conf.urls.static import static


def api_home(_request):
    """Page racine — l’API vit sous /api/, pas sur /."""
    return JsonResponse(
        {
            "name": "MK Event API",
            "status": "ok",
            "docs": {
                "login": "POST /api/auth/login/",
                "register": "POST /api/auth/register/",
                "events": "GET /api/events/ (JWT)",
                "public_invite": "GET /api/inv/{slug}/",
                "admin": "/admin/",
            },
            "demo": {
                "email": "sarah@mkevent.app",
                "password": "mk-event-2026",
                "invite": "/api/inv/lea-thomas/",
            },
            "frontend": "Lancer Expo (npm start) — pas cette URL pour l’app.",
        }
    )


urlpatterns = [
    path("", api_home, name="api-home"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("events.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
