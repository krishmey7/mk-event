from django.contrib import admin

from .models import (
    AdminEarning,
    AdminWithdrawal,
    Event,
    EventPayment,
    Guest,
    GuestbookEntry,
    InvitationTemplate,
    RSVPResponse,
    Table,
)


@admin.register(InvitationTemplate)
class InvitationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "category", "is_active", "is_premium")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "organizer", "type", "status", "event_date", "slug")
    list_filter = ("type", "status")
    search_fields = ("name", "slug", "venue_city")


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ("name", "event", "seats")
    search_fields = ("name",)


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ("full_name", "event", "rsvp_status", "table", "checked_in")
    list_filter = ("rsvp_status", "checked_in")
    search_fields = ("full_name", "email", "access_token")


@admin.register(RSVPResponse)
class RSVPResponseAdmin(admin.ModelAdmin):
    list_display = ("guest", "event", "answer", "responded_at")


@admin.register(GuestbookEntry)
class GuestbookEntryAdmin(admin.ModelAdmin):
    list_display = ("author_name", "event", "is_visible", "created_at")
    list_filter = ("is_visible",)
    search_fields = ("author_name", "message")


@admin.register(EventPayment)
class EventPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "external_reference",
        "event",
        "payment_method",
        "guest_quota",
        "amount",
        "currency",
        "status",
        "created_at",
    )
    list_filter = ("status", "payment_method", "currency")
    search_fields = ("external_reference", "provider_payment_id", "event__name")
    readonly_fields = ("created_at", "updated_at", "paid_at")


@admin.register(AdminEarning)
class AdminEarningAdmin(admin.ModelAdmin):
    list_display = ("user", "payment", "share_percent", "amount", "currency", "created_at")
    list_filter = ("currency",)
    search_fields = ("user__email", "payment__external_reference")
    readonly_fields = tuple(field.name for field in AdminEarning._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request):
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(AdminWithdrawal)
class AdminWithdrawalAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "external_reference",
        "amount",
        "fee",
        "currency",
        "status",
        "created_at",
    )
    list_filter = ("status", "currency")
    search_fields = ("user__email", "external_reference", "provider_withdrawal_id")
    readonly_fields = tuple(field.name for field in AdminWithdrawal._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request):
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser
