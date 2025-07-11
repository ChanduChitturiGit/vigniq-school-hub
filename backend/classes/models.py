from django.db import models

class Class(models.Model):
    name = models.CharField(max_length=50)
    section = models.CharField(max_length=15, blank=True, null=True)


    class Meta:
        db_table = 'school_class_list'
        constraints = [
            models.UniqueConstraint(fields=['name', 'section'], name='unique_name_section')
        ]

    def __str__(self):
        return f"{self.name} - {self.section}"
