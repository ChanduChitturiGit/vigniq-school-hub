from django.db import models

class Class(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        db_table = 'class'

class Section(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        db_table = 'section'