from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EventGuestbookViewSet,
    EventPayView,
    EventPaymentStatusView,
    EventViewSet,
    GuestViewSet,
    KibaWalletWebhookView,
    PublicGuestbookView,
    PublicInvitationView,
    PublicRSVPView,
    TableViewSet,
)
from .views_places import PlaceReverseView, PlaceSearchView

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")

urlpatterns = [
    path("", include(router.urls)),
    path("places/search/", PlaceSearchView.as_view(), name="places-search"),
    path("places/locate/", PlaceReverseView.as_view(), name="places-locate"),
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
        "events/<int:event_id>/guests/<int:pk>/grant-link/",
        GuestViewSet.as_view({"post": "grant_link"}),
        name="event-guest-grant-link",
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
    path(
        "events/<int:event_id>/guestbook/",
        EventGuestbookViewSet.as_view({"get": "list"}),
        name="event-guestbook",
    ),
    path(
        "events/<int:event_id>/guestbook/<int:pk>/",
        EventGuestbookViewSet.as_view({"delete": "destroy"}),
        name="event-guestbook-detail",
    ),
    path(
        "events/<int:pk>/pay/",
        EventPayView.as_view(),
        name="event-pay",
    ),
    path(
        "events/<int:pk>/payment-status/",
        EventPaymentStatusView.as_view(),
        name="event-payment-status",
    ),
    path(
        "payments/kibawallet/webhook/",
        KibaWalletWebhookView.as_view(),
        name="kibawallet-webhook",
    ),
    path("inv/<slug:slug>/", PublicInvitationView.as_view(), name="public-invitation"),
    path("inv/<slug:slug>/rsvp/", PublicRSVPView.as_view(), name="public-rsvp"),
    path(
        "inv/<slug:slug>/guestbook/",
        PublicGuestbookView.as_view(),
        name="public-guestbook",
    ),
]
