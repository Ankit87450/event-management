from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_add_meal_parking_taken'),
    ]

    operations = [
        migrations.AddField(
            model_name='management',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]