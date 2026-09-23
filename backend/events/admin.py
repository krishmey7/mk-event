from django.contrib import admin

from .models import Event, Guest, GuestbookEntry, InvitationTemplate, RSVPResponse, Table


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
