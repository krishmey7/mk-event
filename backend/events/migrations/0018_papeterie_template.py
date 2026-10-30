from django.db import migrations


def ensure_papeterie_template(apps, schema_editor):
    template_model = apps.get_model("events", "InvitationTemplate")
    template_model.objects.get_or_create(
        slug="papeterie",
        defaults={
            "name": "Papier végétal",
            "category": "wedding",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0017_event_retention_notice_sent_at_and_more"),
    ]

    operations = [
        migrations.RunPython(ensure_papeterie_template, migrations.RunPython.noop),
    ]
