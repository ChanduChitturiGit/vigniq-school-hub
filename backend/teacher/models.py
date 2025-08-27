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

class Exam(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Mid Term", "Finals"
    exam_type = models.CharField(
        max_length=10, choices=ExamType.choices, default=ExamType.OFFLINE
    )
    academic_year = models.ForeignKey(
        'academics.SchoolAcademicYear', on_delete=models.CASCADE
    )
    class_section = models.ForeignKey(
        'classes.SchoolSection', on_delete=models.CASCADE
    )
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.exam_type})"


class ExamSubject(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="subjects")
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE)
    max_marks = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.exam.name} - {self.subject.name}"


class ExamResult(models.Model):
    exam_subject = models.ForeignKey(ExamSubject, on_delete=models.CASCADE)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        unique_together = ('exam_subject', 'student')

    def __str__(self):
        return f"{self.student} - {self.exam_subject}: {self.marks_obtained}"
