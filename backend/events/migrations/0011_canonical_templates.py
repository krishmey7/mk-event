"""
Garantit la présence des modèles canoniques référencés par le front.

Le front identifie désormais un modèle par son slug (stable). Cette migration
crée les lignes manquantes sans toucher aux modèles déjà personnalisés :
les IDs restent propres à chaque base, seul le slug fait foi.
"""

from django.db import migrations

CANONICAL_TEMPLATES = (
    ("elegance", "Élégance", "wedding"),
    ("hiver", "Hiver", "wedding"),
    ("aurore", "Aurore", "wedding"),
    ("pellicule", "Pellicule", "wedding"),
    ("neon", "Néon", "wedding"),
    ("celebration", "Célébration", "birthday"),
    ("summit", "Summit", "corporate"),
    ("moderne", "Moderne", "birthday"),
)


def ensure_canonical_templates(apps, schema_editor):
    Template = apps.get_model("events", "InvitationTemplate")
    for slug, name, category in CANONICAL_TEMPLATES:
        Template.objects.get_or_create(
            slug=slug,
            defaults={"name": name, "category": category},
        )


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0010_neon_template"),
    ]

    operations = [
        migrations.RunPython(ensure_canonical_templates, migrations.RunPython.noop),
    ]
