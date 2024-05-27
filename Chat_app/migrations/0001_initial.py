# Generated by Django 5.0.6 on 2024-05-24 13:13

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Message",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("body", models.TextField()),
                ("sent_by", models.CharField(max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ("created_at",),
            },
        ),
        migrations.CreateModel(
            name="Room",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("uuid", models.CharField(max_length=255)),
                ("client", models.CharField(max_length=255)),
                ("url", models.CharField(blank=True, max_length=255, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("waiting", "Waiting"),
                            ("active", "Active"),
                            ("closed", "Closed"),
                        ],
                        default="waiting",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ("created_at",),
            },
        ),
    ]