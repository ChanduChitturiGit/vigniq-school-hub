from django.db import models

class Class(models.Model):
    name = models.CharField(max_length=50)
    grade = models.CharField(max_length=15)


    class Meta:
        db_table = 'school_class'
        constraints = [
            models.UniqueConstraint(fields=['name', 'grade'], name='unique_name_grade')
        ]

    def __str__(self):
        return f"{self.name} - {self.grade}"

class Section(models.Model):
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50)

    class Meta:
        db_table = 'class_section'
        constraints = [
            models.UniqueConstraint(fields=['name', 'school_class'], name='unique_name_school_class')
        ]