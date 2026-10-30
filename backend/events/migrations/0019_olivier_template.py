from django.db import migrations


def ensure_olivier_template(apps, schema_editor):
    template_model = apps.get_model("events", "InvitationTemplate")
    template_model.objects.get_or_create(
        slug="olivier",
        defaults={
            "name": "Vert d’olive",
            "category": "wedding",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0018_papeterie_template"),
    ]

    operations = [
        migrations.RunPython(ensure_olivier_template, migrations.RunPython.noop),
    ]
