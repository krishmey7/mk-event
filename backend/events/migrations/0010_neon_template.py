from django.db import connection, migrations


def add_neon(apps, schema_editor):
    Template = apps.get_model("events", "InvitationTemplate")
    if Template.objects.filter(slug="neon").exists():
        return
    if not Template.objects.filter(pk=9).exists():
        Template.objects.create(
            id=9,
            slug="neon",
            name="Néon",
            category="wedding",
        )
    else:
        Template.objects.create(
            slug="neon",
            name="Néon",
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
        ("events", "0009_pellicule_template"),
    ]

    operations = [
        migrations.RunPython(add_neon, migrations.RunPython.noop),
    ]
