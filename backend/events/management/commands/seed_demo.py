from datetime import datetime, timezone as dt_timezone

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event, Guest, InvitationTemplate, Table

User = get_user_model()


class Command(BaseCommand):
    help = "Crée un organisateur démo + 3 invitations (alignées maquette)."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email="sarah@mkevent.app",
            defaults={
                "full_name": "Sarah Morgan",
                "role": User.Role.ORGANIZER,
            },
        )
        if created:
            user.set_password("mk-event-2026")
            user.save()
            self.stdout.write(self.style.SUCCESS("Organisateur sarah@mkevent.app créé (mdp: mk-event-2026)"))
        else:
            self.stdout.write("Organisateur sarah@mkevent.app déjà présent")

        templates = [
            ("elegance", "Élégance", "wedding"),
            ("hiver", "Hiver", "wedding"),
            ("celebration", "Célébration", "birthday"),
            ("summit", "Summit", "corporate"),
            ("moderne", "Moderne", "birthday"),
        ]
        template_objs = {}
        for slug, name, category in templates:
            obj, _ = InvitationTemplate.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "category": category,
                    "thumbnail_url": "",
                    "is_active": True,
                },
            )
            template_objs[slug] = obj

        demos = [
            {
                "slug": "lea-thomas",
                "name": "Mariage – Léa & Thomas",
                "type": Event.Type.WEDDING,
                "template": template_objs["elegance"],
                "event_date": timezone.make_aware(datetime(2025, 6, 14, 15, 0), dt_timezone.utc),
                "venue_name": "Château de Bellevue",
                "venue_city": "Blois",
                "message": "Nous aurons hâte de célébrer ce jour spécial avec vous !",
                "guests": [
                    ("Camille Moreau", Guest.RsvpStatus.CONFIRMED, "Table d'honneur", "Champagne"),
                    ("Marc Lefèvre", Guest.RsvpStatus.CONFIRMED, "Table 1", "Vin rouge"),
                    ("Emma Petit", Guest.RsvpStatus.CONFIRMED, "Table 2", "Eau"),
                    ("Paul Martin", Guest.RsvpStatus.DECLINED, None, None),
                ],
            },
            {
                "slug": "anniversaire-30-ans",
                "name": "Anniversaire – 30 ans",
                "type": Event.Type.BIRTHDAY,
                "template": template_objs["moderne"],
                "event_date": timezone.make_aware(datetime(2025, 4, 12, 19, 0), dt_timezone.utc),
                "venue_name": "Loft des Arts",
                "venue_city": "Lyon",
                "message": None,
                "guests": [
                    (f"Invité {i}", status, f"Table {(i % 5) + 1}", None)
                    for i, status in enumerate(
                        [Guest.RsvpStatus.CONFIRMED] * 12
                        + [Guest.RsvpStatus.PENDING] * 6
                        + [Guest.RsvpStatus.DECLINED] * 2
                    )
                ],
            },
            {
                "slug": "bapteme-emma",
                "name": "Baptême – Emma",
                "type": Event.Type.BAPTISM,
                "template": template_objs["hiver"],
                "event_date": timezone.make_aware(datetime(2025, 5, 5, 11, 0), dt_timezone.utc),
                "venue_name": "Église Saint-Pierre",
                "venue_city": "Tours",
                "message": None,
                "guests": [
                    (f"Invité {i}", status, f"Table {(i % 4) + 1}", None)
                    for i, status in enumerate(
                        [Guest.RsvpStatus.CONFIRMED] * 8
                        + [Guest.RsvpStatus.MAYBE] * 1
                        + [Guest.RsvpStatus.DECLINED] * 6
                    )
                ],
            },
        ]

        for demo in demos:
            event, _ = Event.objects.update_or_create(
                slug=demo["slug"],
                defaults={
                    "organizer": user,
                    "name": demo["name"],
                    "type": demo["type"],
                    "status": Event.Status.PUBLISHED,
                    "template": demo["template"],
                    "event_date": demo["event_date"],
                    "venue_name": demo["venue_name"],
                    "venue_city": demo["venue_city"],
                    "message": demo["message"],
                },
            )
            # Tables
            table_names = sorted(
                {
                    g[2]
                    for g in demo["guests"]
                    if g[2]
                }
                | {"Table d'honneur", "Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6"}
            )
            tables = {}
            for name in table_names:
                table, _ = Table.objects.get_or_create(event=event, name=name, defaults={"seats": 8})
                tables[name] = table

            if not event.guests.exists():
                for full_name, rsvp, table_name, drink in demo["guests"]:
                    Guest.objects.create(
                        event=event,
                        full_name=full_name,
                        email=f"{full_name.lower().replace(' ', '.')}@email.fr",
                        rsvp_status=rsvp,
                        adults_count=1,
                        table=tables.get(table_name) if table_name else None,
                        drink=drink,
                        responded_at=timezone.now() if rsvp != Guest.RsvpStatus.PENDING else None,
                    )
            self.stdout.write(self.style.SUCCESS(f"Événement prêt : {event.slug}"))

        self.stdout.write(self.style.SUCCESS("Seed terminé."))
