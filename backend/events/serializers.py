from django.db.models import Count, Q
from rest_framework import serializers

from .models import Event, Guest, InvitationTemplate, RSVPResponse, Table


class InvitationTemplateSerializer(serializers.ModelSerializer):
    palette = serializers.SerializerMethodField()

    class Meta:
        model = InvitationTemplate
        fields = (
            "id",
            "slug",
            "name",
            "category",
            "thumbnail_url",
            "preview_url",
            "palette",
            "is_premium",
            "is_active",
            "created_at",
        )

    def get_palette(self, obj):
        return {
            "background": "#F3EEE4",
            "accent": "#C4A574",
            "text": "#1C1712",
        }


class TableSerializer(serializers.ModelSerializer):
    seats_taken = serializers.IntegerField(read_only=True)

    class Meta:
        model = Table
        fields = ("id", "event", "name", "seats", "seats_taken", "notes")
        read_only_fields = ("id", "event", "seats_taken")


class GuestSerializer(serializers.ModelSerializer):
    table_detail = TableSerializer(source="table", read_only=True)

    class Meta:
        model = Guest
        fields = (
            "id",
            "event",
            "full_name",
            "email",
            "phone",
            "avatar_url",
            "rsvp_status",
            "adults_count",
            "children_count",
            "table",
            "table_detail",
            "drink",
            "access_token",
            "studio_key",
            "checked_in",
            "checked_in_at",
            "responded_at",
            "created_at",
        )
        read_only_fields = (
            "id",
            "event",
            "access_token",
            "checked_in",
            "checked_in_at",
            "responded_at",
            "created_at",
            "table_detail",
        )


class GuestWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = (
            "full_name",
            "email",
            "phone",
            "rsvp_status",
            "adults_count",
            "children_count",
            "table",
            "drink",
            "studio_key",
        )


class EventSerializer(serializers.ModelSerializer):
    guests_count = serializers.IntegerField(read_only=True)
    rsvp_summary = serializers.SerializerMethodField()
    program = serializers.SerializerMethodField()
    playlist = serializers.SerializerMethodField()
    gifts = serializers.SerializerMethodField()
    practical_info = serializers.SerializerMethodField()
    template_detail = InvitationTemplateSerializer(source="template", read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "organizer",
            "name",
            "type",
            "status",
            "template",
            "template_detail",
            "event_date",
            "venue_name",
            "venue_city",
            "message",
            "slug",
            "qr_code_url",
            "cover_image_url",
            "guests_count",
            "rsvp_summary",
            "program",
            "playlist",
            "gifts",
            "practical_info",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "organizer",
            "slug",
            "guests_count",
            "rsvp_summary",
            "program",
            "playlist",
            "gifts",
            "practical_info",
            "created_at",
            "updated_at",
            "template_detail",
        )

    def get_rsvp_summary(self, obj: Event) -> dict:
        if hasattr(obj, "confirmed_count"):
            confirmed = obj.confirmed_count or 0
            pending = obj.pending_count or 0
            maybe = obj.maybe_count or 0
            declined = obj.declined_count or 0
            total = obj.guests_count or (confirmed + pending + maybe + declined)
        else:
            agg = obj.guests.aggregate(
                total=Count("id"),
                confirmed=Count("id", filter=Q(rsvp_status=Guest.RsvpStatus.CONFIRMED)),
                pending=Count("id", filter=Q(rsvp_status=Guest.RsvpStatus.PENDING)),
                maybe=Count("id", filter=Q(rsvp_status=Guest.RsvpStatus.MAYBE)),
                declined=Count("id", filter=Q(rsvp_status=Guest.RsvpStatus.DECLINED)),
            )
            total = agg["total"] or 0
            confirmed = agg["confirmed"] or 0
            pending = agg["pending"] or 0
            maybe = agg["maybe"] or 0
            declined = agg["declined"] or 0
        return {
            "total": total,
            "confirmed": confirmed,
            "pending": pending,
            "maybe": maybe,
            "declined": declined,
        }

    def get_program(self, obj):
        return []

    def get_playlist(self, obj):
        return []

    def get_gifts(self, obj):
        return []

    def get_practical_info(self, obj):
        return []


class EventDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = (
            "name",
            "type",
            "event_date",
            "venue_name",
            "venue_city",
            "message",
            "template",
        )


class RSVPSubmitSerializer(serializers.Serializer):
    access_token = serializers.CharField(required=False, allow_blank=True)
    answer = serializers.ChoiceField(choices=RSVPResponse.Answer.choices)
    adults_count = serializers.IntegerField(min_value=0, default=1)
    children_count = serializers.IntegerField(min_value=0, default=0)
    message = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    drink = serializers.CharField(required=False, allow_blank=True, allow_null=True)
