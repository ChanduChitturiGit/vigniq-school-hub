# Generated by Django 5.2.3 on 2025-07-19 19:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0002_initial'),
        ('teacher', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='classassignment',
            name='class_teacher',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='teacher.teacher'),
        ),
    ]
