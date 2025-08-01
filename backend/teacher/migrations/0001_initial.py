# Generated by Django 5.2.3 on 2025-07-16 17:57

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('academics', '0001_initial'),
        ('classes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'db_table': 'subject',
            },
        ),
        migrations.CreateModel(
            name='Teacher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('teacher_id', models.IntegerField(unique=True)),
                ('qualification', models.CharField(blank=True, max_length=255, null=True)),
                ('experience', models.FloatField(blank=True, null=True)),
                ('joining_date', models.DateField(blank=True, null=True)),
                ('emergency_contact', models.CharField(blank=True, max_length=15, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
            ],
            options={
                'db_table': 'teacher',
            },
        ),
        migrations.CreateModel(
            name='TeacherSubjectAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('academic_year', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='academics.schoolacademicyear')),
                ('school_class', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='classes.schoolclass')),
                ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='teacher.subject')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='teacher.teacher')),
            ],
            options={
                'db_table': 'teacher_subject_assignment',
                'unique_together': {('teacher', 'subject', 'school_class', 'academic_year')},
            },
        ),
        migrations.AddField(
            model_name='teacher',
            name='subjects',
            field=models.ManyToManyField(through='teacher.TeacherSubjectAssignment', to='teacher.subject'),
        ),
    ]
