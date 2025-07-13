from django.db import models

# Create your models here.
class Student(models.Model):
    student_id = models.IntegerField()
    roll_number = models.CharField(max_length=20)
    admission_date = models.DateField()
    parent_name = models.CharField(max_length=100)
    parent_phone = models.CharField(max_length=15)
    parent_email = models.EmailField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_list'
        constraints = [
            models.UniqueConstraint(fields=['student_id', 'roll_number'],
                                    name='unique_student_id_roll_number')
        ]

class StudentClassAssignment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    class_instance = models.ForeignKey('classes.Class', on_delete=models.CASCADE)
    academic_year = models.ForeignKey('academics.AcademicYear', on_delete=models.CASCADE)

    class Meta:
        db_table = 'student_class_assignment'

        constraints = [
            models.UniqueConstraint(fields=['student', 'academic_year'],
                                    name='unique_student_academic_year')
        ]