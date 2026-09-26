from django.db import connection, migrations


def add_herbier(apps, schema_editor):
    Template = apps.get_model("events", "InvitationTemplate")
    if Template.objects.filter(slug="herbier").exists():
        return
    if not Template.objects.filter(pk=6).exists():
        Template.objects.create(
            id=6,
            slug="herbier",
            name="Herbier",
            category="wedding",
        )
    else:
        Template.objects.create(
            slug="herbier",
            name="Herbier",
            category="wedding",
        )
    if connection.vendor == "postgresql":
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval(pg_get_serial_sequence('events_invitationtemplate', 'id'), "
                "(SELECT MAX(id) FROM events_invitationtemplate))"
            )


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0005_guestbook_entry"),
    ]

    operations = [
        migrations.RunPython(add_herbier, migrations.RunPython.noop),
    ]
