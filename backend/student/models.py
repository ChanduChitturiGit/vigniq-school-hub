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
        # constraints = [
        #     models.UniqueConstraint(fields=['student_id', 'roll_number'],
        #                             name='unique_student_id_roll_number')
        # ]

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
    SESSION_CHOICES = [
        ('M', 'Morning'),
        ('A', 'Afternoon'),
    ]

    date = models.DateField()
    session = models.CharField(max_length=1, choices=SESSION_CHOICES)
    class_section = models.ForeignKey('classes.SchoolSection', on_delete=models.CASCADE,null=True, blank=True)
    academic_year = models.ForeignKey('academics.SchoolAcademicYear', on_delete=models.CASCADE,
                                      null=True, blank=True)
    is_holiday = models.BooleanField(default=False, )
    taken_by_user_id = models.IntegerField(null=True, blank=True)
    updated_by_user_id = models.IntegerField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['session']),
            models.Index(fields=['academic_year']),
        ]

        db_table = 'student_attendance'

class StudentAttendanceData(models.Model):
    """Stores attendance for each student per session per date."""
    attendance = models.ForeignKey(StudentAttendance, on_delete=models.CASCADE,
                                   related_name="attendance_data")
    student = models.ForeignKey(Student, on_delete=models.CASCADE,
                                related_name="attendances")
    
    is_present = models.BooleanField(default=True)
    remarks = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'attendance'],
                name='unique_student_attendance'
            )
        ]
        indexes = [
            models.Index(fields=['attendance', 'student']),
        ]

        db_table = 'student_attendance_data'