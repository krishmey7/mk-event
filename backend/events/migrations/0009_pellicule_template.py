from django.db import connection, migrations


def add_pellicule(apps, schema_editor):
    Template = apps.get_model("events", "InvitationTemplate")
    if Template.objects.filter(slug="pellicule").exists():
        return
    if not Template.objects.filter(pk=8).exists():
        Template.objects.create(
            id=8,
            slug="pellicule",
            name="Pellicule",
            category="wedding",
        )
    else:
        Template.objects.create(
            slug="pellicule",
            name="Pellicule",
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
        ("events", "0008_aurore_template"),
    ]

    operations = [
        migrations.RunPython(add_pellicule, migrations.RunPython.noop),
    ]
