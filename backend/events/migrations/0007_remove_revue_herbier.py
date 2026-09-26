from django.db import migrations


def remove_created_templates(apps, schema_editor):
    Template = apps.get_model("events", "InvitationTemplate")
    Template.objects.filter(slug__in=["editorial", "herbier"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0006_herbier_template"),
    ]

    operations = [
        migrations.RunPython(remove_created_templates, migrations.RunPython.noop),
    ]
