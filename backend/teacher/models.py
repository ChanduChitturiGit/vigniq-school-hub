from django.db import models

from classes.models import Class, Section

class Subject(models.Model):
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'subject'




class Teacher(models.Model):
    teacher_id = models.IntegerField()
    qualification = models.CharField(max_length=255, null=True, blank=True)
    experience = models.FloatField(null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=15, null=True, blank=True)
    subjects = models.ManyToManyField('Subject', through='TeacherSubjectAssignment')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    class Meta:
        db_table = 'teacher'

class TeacherSubjectAssignment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    class Meta:
        db_table = 'teacher_subject_assignment'
        unique_together = ('teacher', 'subject', 'school_class', 'section')

