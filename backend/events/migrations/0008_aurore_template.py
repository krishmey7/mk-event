from django.db import connection, migrations


def add_aurore(apps, schema_editor):
    Template = apps.get_model("events", "InvitationTemplate")
    if Template.objects.filter(slug="aurore").exists():
        return
    if not Template.objects.filter(pk=7).exists():
        Template.objects.create(
            id=7,
            slug="aurore",
            name="Aurore",
            category="wedding",
        )
    else:
        Template.objects.create(
            slug="aurore",
            name="Aurore",
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
        ("events", "0007_remove_revue_herbier"),
    ]

    operations = [
        migrations.RunPython(add_aurore, migrations.RunPython.noop),
    ]
