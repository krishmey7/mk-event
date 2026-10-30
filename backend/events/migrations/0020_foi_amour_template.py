from django.db import migrations


def ensure_foi_amour_template(apps, schema_editor):
    template_model = apps.get_model("events", "InvitationTemplate")
    template_model.objects.get_or_create(
        slug="foi-amour",
        defaults={
            "name": "Foi & Amour",
            "category": "wedding",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0019_olivier_template"),
    ]

    operations = [
        migrations.RunPython(ensure_foi_amour_template, migrations.RunPython.noop),
    ]
