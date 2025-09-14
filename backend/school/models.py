from django.db import models
from core.models import (
    AbstractChapter,
    AbstractSubTopic,
    AbstractPrerequisite,
    AbstractAcademicYear,
    AbstractSubject
)


class School(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    school_admin = models.ForeignKey('core.User',
                        on_delete=models.CASCADE,
                        related_name='schools',
                        null=True, blank=True)
    boards = models.ManyToManyField(
        'SchoolBoard',
        through='SchoolBoardMapping',
        related_name='schools'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)

    class Meta:
        db_table = 'school'

    def __str__(self):
        return self.name
    
class SchoolDbMetadata(models.Model):
    school = models.OneToOneField(School, on_delete=models.CASCADE,
                                  related_name='metadata')
    db_name = models.CharField(max_length=255, unique=True)
    db_user = models.CharField(max_length=100)
    db_password = models.CharField(max_length=100)
    db_host = models.CharField(max_length=100, default='127.0.0.1')
    db_port = models.IntegerField(default=5432)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'school_db_metadata'

    def __str__(self):
        return f"{self.school.name} - {self.db_name}"
    
class SchoolBoard(models.Model):
    board_name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'school_board'
    
    def __str__(self):
        return self.board_name
    

class SchoolBoardMapping(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    board = models.ForeignKey(SchoolBoard, on_delete=models.CASCADE)

    class Meta:
        db_table = 'school_board_mapping'
        constraints = [
            models.UniqueConstraint(fields=['school', 'board'], name='unique_school_board')
        ]

class SchoolDefaultClasses(models.Model):
    class_number = models.PositiveIntegerField(unique=True)

    class Meta:
        db_table = 'school_default_classes'

class SchoolDefaultSubjects(AbstractSubject):
    class Meta(AbstractSubject.Meta):
        db_table = 'school_default_subjects'

class SchoolSyllabusEbooks(models.Model):
    board = models.ForeignKey(SchoolBoard, on_delete=models.CASCADE)
    subject = models.ForeignKey(SchoolDefaultSubjects, on_delete=models.CASCADE)
    class_number = models.ForeignKey(SchoolDefaultClasses, on_delete=models.CASCADE)
    ebook_type = models.CharField(max_length=50, null=True, choices=[
        ('single', 'Single'),
        ('chapter_wise', 'Chapter Wise'),
    ])
    ebook_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    syllabus_year = models.IntegerField(null=True, blank=True)
    chapter_number = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'school_syllabus_ebooks'
        unique_together = ('board', 'subject', 'class_number', 'ebook_name', 'created_at')

class AcademicYear(AbstractAcademicYear):
    class Meta:
        db_table = 'school_academic_year'
        unique_together = ('start_year', 'end_year')
        ordering = ['start_year', 'end_year']

class Chapter(AbstractChapter):
    ebook = models.ForeignKey(SchoolSyllabusEbooks, on_delete=models.CASCADE, null=True, blank=True)

    class Meta(AbstractChapter.Meta):
        db_table = 'syllabus_chapter'
        unique_together = ('chapter_number', 'ebook')

class SubTopic(AbstractSubTopic):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='sub_topics')

    class Meta(AbstractSubTopic.Meta):
        db_table = 'syllabus_sub_topic'
        unique_together = ('chapter', 'name')


class Prerequisite(AbstractPrerequisite):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='prerequisites')

    class Meta(AbstractPrerequisite.Meta):
        db_table = 'syllabus_prerequisite'
        unique_together = ('chapter', 'topic')
