from django.conf import settings
from django.db import migrations
from django.core.management import call_command

def load_fixture(apps, schema_editor):
    
    db_name = getattr(settings, 'CURRENT_MIGRATION_DB', 'default')

    fixtures = ['class.json','section.json']
    for fixture in fixtures:
        call_command('loaddata', fixture,database=db_name)

class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_fixture),
    ]
