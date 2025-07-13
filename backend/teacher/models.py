from django.db import models

from classes.models import Class
from academics.models import AcademicYear

from core.models import User
class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        db_table = 'subject'




class Teacher(models.Model):
    teacher_id = models.IntegerField(unique=True)
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
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE,null=True, blank=True)

    class Meta:
        db_table = 'teacher_subject_assignment'
        unique_together = ('teacher', 'subject', 'school_class','academic_year')

