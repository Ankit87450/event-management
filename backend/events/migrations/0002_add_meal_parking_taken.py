from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='management',
            name='meal_taken',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='management',
            name='parking_taken',
            field=models.BooleanField(default=False),
        ),
    ]