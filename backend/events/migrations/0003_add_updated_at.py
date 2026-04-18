from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_add_meal_parking_taken'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name='event_management' AND column_name='updated_at'
                    ) THEN
                        ALTER TABLE event_management ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
                    END IF;
                END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]