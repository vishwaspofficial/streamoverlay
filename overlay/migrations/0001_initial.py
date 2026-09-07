from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='OverlayState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('study_minutes', models.PositiveIntegerField(default=25)),
                ('total_sessions', models.PositiveIntegerField(default=4)),
                ('weekly_goals', models.JSONField(default=list)),
                ('daily_goals', models.JSONField(default=list)),
                ('visibility', models.JSONField(default=dict)),
                ('brb', models.BooleanField(default=False)),
                ('exercise_sessions', models.PositiveIntegerField(default=0)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
