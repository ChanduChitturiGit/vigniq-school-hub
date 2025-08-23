from django.db import models

# Create your models here.
class Student(models.Model):
    student_id = models.IntegerField(primary_key=True)
    roll_number = models.CharField(max_length=20)
    admission_date = models.DateField()
    parent_name = models.CharField(max_length=100)
    parent_phone = models.CharField(max_length=15)
    parent_email = models.EmailField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student'
        constraints = [
            models.UniqueConstraint(fields=['student_id', 'roll_number'],
                                    name='unique_student_id_roll_number')
        ]

class StudentClassAssignment(models.Model):
    student = models.ForeignKey(Student, to_field='student_id', on_delete=models.CASCADE)
    class_instance = models.ForeignKey('classes.SchoolSection', on_delete=models.CASCADE)
    academic_year = models.ForeignKey('academics.SchoolAcademicYear', on_delete=models.CASCADE)

    class Meta:
        db_table = 'student_class_assignment'

        constraints = [
            models.UniqueConstraint(fields=['student', 'academic_year'],
                                    name='unique_student_academic_year')
        ]


class StudentAttendance(models.Model):
    """Stores attendance for each student per session per date."""
    SESSION_CHOICES = [
        ('M', 'Morning'),
        ('A', 'Afternoon'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE,
                                related_name="attendances")
    date = models.DateField()
    session = models.CharField(max_length=1, choices=SESSION_CHOICES)
    is_present = models.BooleanField(default=True)
    academic_year = models.ForeignKey('academics.SchoolAcademicYear', on_delete=models.CASCADE,
                                      null=True, blank=True)
    taken_by_user_id = models.IntegerField(null=True, blank=True)
    updated_by_user_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'date', 'session', 'academic_year'],
                name='unique_student_date_session_academic_year'
            )
        ]
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['session']),
            models.Index(fields=['student', 'date']),
        ]

        db_table = 'student_attendance'