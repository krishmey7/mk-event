from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EventViewSet,
    GuestViewSet,
    PublicInvitationView,
    PublicRSVPView,
    TableViewSet,
)

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "events/<int:event_id>/guests/",
        GuestViewSet.as_view({"get": "list", "post": "create"}),
        name="event-guests",
    ),
    path(
        "events/<int:event_id>/guests/<int:pk>/",
        GuestViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="event-guest-detail",
    ),
    path(
        "events/<int:event_id>/guests/<int:pk>/check-in/",
        GuestViewSet.as_view({"post": "check_in"}),
        name="event-guest-check-in",
    ),
    path(
        "events/<int:event_id>/tables/",
        TableViewSet.as_view({"get": "list", "post": "create"}),
        name="event-tables",
    ),
    path(
        "events/<int:event_id>/tables/<int:pk>/",
        TableViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="event-table-detail",
    ),
    path("inv/<slug:slug>/", PublicInvitationView.as_view(), name="public-invitation"),
    path("inv/<slug:slug>/rsvp/", PublicRSVPView.as_view(), name="public-rsvp"),
]
