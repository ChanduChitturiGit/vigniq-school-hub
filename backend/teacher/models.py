from django.db import models

from classes.models import SchoolSection
from academics.models import SchoolAcademicYear

from core.models import User,AbstractSubject

class Subject(AbstractSubject):
    class Meta:
        db_table = 'subject'




class Teacher(models.Model):
    teacher_id = models.IntegerField(primary_key=True)
    qualification = models.CharField(max_length=255, null=True, blank=True)
    experience = models.FloatField(null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=15, null=True, blank=True)
    subjects = models.ManyToManyField('Subject', through='TeacherSubjectAssignment')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    @property
    def full_name(self):
        user_instance = User.objects.filter(id=self.teacher_id).first()
        if user_instance:
            return f"{user_instance.first_name} {user_instance.last_name}"
        return "Unknown Teacher"
    class Meta:
        db_table = 'teacher'

class TeacherSubjectAssignment(models.Model):
    teacher = models.ForeignKey(Teacher, to_field='teacher_id', on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    school_class = models.ForeignKey(SchoolSection, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(SchoolAcademicYear, on_delete=models.CASCADE,null=True, blank=True)

    class Meta:
        db_table = 'teacher_subject_assignment'
        unique_together = ('teacher', 'subject', 'school_class','academic_year')


class ExamType(models.TextChoices):
    OFFLINE = "offline", "Offline"
    ONLINE = "online", "Online"

class ExamCategory(models.Model):
    name = models.CharField(max_length=100)

class Exam(models.Model):
    name = models.CharField(max_length=100)
    exam_category = models.ForeignKey(ExamCategory, on_delete=models.CASCADE)
    exam_type = models.CharField(
        max_length=10, choices=ExamType.choices, default=ExamType.OFFLINE
    )
    academic_year = models.ForeignKey(
        'academics.SchoolAcademicYear', on_delete=models.CASCADE
    )
    class_section = models.ForeignKey(
        'classes.SchoolSection', on_delete=models.CASCADE
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    max_marks = models.PositiveIntegerField()
    pass_marks = models.PositiveIntegerField()
    exam_date = models.DateField(null=True)
    is_active = models.BooleanField(default=True)
    created_by_teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    updated_by_teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.exam_type})"

class ExamResult(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    updated_by_teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        unique_together = [
            models.UniqueConstraint(fields=['exam', 'student'], name='unique_exam_student')
        ]

    def __str__(self):
        return f"{self.student} - {self.exam}: {self.marks_obtained}"
