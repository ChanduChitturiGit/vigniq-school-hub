from django.db import models
from academics.models import SchoolAcademicYear
from core.models import  AbstractChapter, AbstractSubTopic, AbstractPrerequisite
from classes.models import SchoolClass, SchoolSection
from teacher.models import Subject 

# Create your models here.
class SchoolChapter(AbstractChapter):
    school_board_id = models.IntegerField()
    academic_year = models.ForeignKey(SchoolAcademicYear, on_delete=models.CASCADE)
    class_number = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    ebook_id = models.IntegerField(null=True, blank=True)

    class Meta(AbstractChapter.Meta):
        db_table = 'syllabus_chapter'
        unique_together = ('school_board_id', 'academic_year', 'chapter_number',
                           'class_number', 'subject')

class SchoolSubTopic(AbstractSubTopic):
    chapter = models.ForeignKey(SchoolChapter, on_delete=models.CASCADE, related_name='sub_topics')

    class Meta(AbstractSubTopic.Meta):
        db_table = 'syllabus_sub_topic'
        unique_together = ('chapter', 'name')

class SchoolPrerequisite(AbstractPrerequisite):
    chapter = models.ForeignKey(SchoolChapter, on_delete=models.CASCADE,
                                related_name='prerequisites')

    class Meta(AbstractPrerequisite.Meta):
        db_table = 'syllabus_prerequisite'
        unique_together = ('chapter', 'topic')

class SchoolClassSubTopic(AbstractSubTopic):
    chapter = models.ForeignKey(SchoolChapter, on_delete=models.CASCADE,
                                related_name='class_sub_topics')
    class_section = models.ForeignKey(SchoolSection, on_delete=models.CASCADE,
                                      null=True, blank=True)
    class Meta(AbstractSubTopic.Meta):
        db_table = 'classwise_sub_topic'

class SchoolClassPrerequisite(AbstractPrerequisite):
    chapter = models.ForeignKey(SchoolChapter, on_delete=models.CASCADE,
                                related_name='class_prerequisites'
                                )
    class_section = models.ForeignKey(SchoolSection, on_delete=models.CASCADE,
                                      null=True, blank=True)
    class Meta(AbstractPrerequisite.Meta):
        db_table = 'classwise_prerequisite'


class SchoolLessonPlanDay(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('started', 'Started'),
        ('completed', 'Completed'),
    ]

    chapter = models.ForeignKey(
        SchoolChapter,
        related_name='school_chapter_lesson_plan_days',
        on_delete=models.CASCADE
    )
    class_section = models.ForeignKey(
        SchoolSection,
        related_name='school_class_lesson_plan_days',
        on_delete=models.CASCADE
    )
    day = models.IntegerField()
    learning_outcomes = models.TextField()
    real_world_applications = models.TextField()
    taxonomy_alignment = models.CharField(max_length=255)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_started'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'school_lesson_plan_day'


class Topic(models.Model):
    lesson_plan_day = models.ForeignKey(
        SchoolLessonPlanDay,
        related_name='school_lesson_topics',
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    summary = models.TextField()
    time_minutes = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'school_lesson_topic'

    def __str__(self):
        return self.title

class ChatSession(models.Model):
    chat_id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    lesson_plan_day = models.ForeignKey(
        SchoolLessonPlanDay,
        related_name='chat_sessions',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    summary = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'chat_session'
        indexes = [
            models.Index(fields=['lesson_plan_day']),
            models.Index(fields=['user_id']),
        ]

class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_message'
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"

class WhiteboardSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True,primary_key=True)
    topic = models.ForeignKey(
        Topic, on_delete=models.CASCADE, related_name="whiteboard_sessions"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'whiteboard_session'
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['topic']),
        ]

class WhiteboardDataChunk(models.Model):
    session = models.ForeignKey(
        WhiteboardSession,
        on_delete=models.CASCADE,
        related_name="data_chunks"
    )
    data = models.JSONField(default=list)  # list of strokes
    chunk_index = models.PositiveIntegerField()  # order of chunks
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'whiteboard_data_chunk'
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'chunk_index'],
                name='unique_session_chunk_index'
            ),
        ]
        ordering = ["chunk_index"]
        indexes = [
            models.Index(fields=['session', 'chunk_index']),
        ]
