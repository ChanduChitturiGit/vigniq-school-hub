from django.db import models

class SchoolClass(models.Model):
    class_number = models.IntegerField(null=True, blank=True)
    section = models.CharField(max_length=15, blank=True, null=True)


    class Meta:
        db_table = 'school_class_list'
        constraints = [
            models.UniqueConstraint(fields=['class_number', 'section'], name='unique_class_number_section')
        ]

    def __str__(self):
        return f"{self.class_number} - {self.section}"


class ClassAssignment(models.Model):
    class_instance = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    class_teacher = models.ForeignKey('teacher.Teacher', on_delete=models.CASCADE,
                                      null=True, blank=True)
    academic_year = models.ForeignKey('academics.AcademicYear', on_delete=models.CASCADE)

    class Meta:
        db_table = 'class_assignment'
        unique_together = ('class_instance', 'class_teacher', 'academic_year')
