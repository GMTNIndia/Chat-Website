# Generated by Django 5.0.6 on 2024-06-09 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0004_remove_adminandagent_is_active_adminandagent_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminandagent',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]