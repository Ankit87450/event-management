from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_add_meal_parking_taken'),
    ]

    operations = [
        migrations.RunSQL(
            sql="UPDATE event_management SET updated_at = created_at WHERE updated_at IS NULL;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]