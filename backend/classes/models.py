from django.db import models

class SchoolClass(models.Model):
    class_number = models.IntegerField(null=True, blank=True)
    class Meta:
        db_table = 'school_class_list'

    def __str__(self):
        return f"{self.class_number} - {self.section}"

class SchoolSection(models.Model):
    class_instance = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    section = models.CharField(max_length=50)
    board_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'school_section'
        constraints = [
            models.UniqueConstraint(fields=['class_instance', 'section'], name='unique_class_instance_section')
        ]

    def __str__(self):
        return f"{self.class_instance_id} - {self.section}"

class ClassAssignment(models.Model):
    class_instance = models.ForeignKey(SchoolSection, on_delete=models.CASCADE)
    class_teacher = models.ForeignKey('teacher.Teacher', on_delete=models.CASCADE,
                                      null=True, blank=True)
    academic_year = models.ForeignKey('academics.SchoolAcademicYear', on_delete=models.CASCADE)

    class Meta:
        db_table = 'class_assignment'
        unique_together = ('class_instance', 'class_teacher', 'academic_year')
