from django.db import models
from academics.models import SchoolAcademicYear
from core.models import  AbstractChapter, AbstractSubTopic, AbstractPrerequisite

# Create your models here.
class SchoolChapter(AbstractChapter):
    school_board_id = models.IntegerField()
    academic_year = models.ForeignKey(SchoolAcademicYear, on_delete=models.CASCADE)
    class Meta(AbstractChapter.Meta):
        db_table = 'syllabus_chapter'
        unique_together = ('school_board_id', 'academic_year', 'chapter_number')

class SchoolSubTopic(AbstractSubTopic):
    chapter = models.ForeignKey(SchoolChapter, on_delete=models.CASCADE, related_name='sub_topics')

    class Meta(AbstractSubTopic.Meta):
        db_table = 'syllabus_sub_topic'
        unique_together = ('chapter', 'name')

class SchoolPrerequisite(AbstractPrerequisite):
    chapter = models.ForeignKey(SchoolChapter, on_delete=models.CASCADE, related_name='prerequisites')

    class Meta(AbstractPrerequisite.Meta):
        db_table = 'syllabus_prerequisite'
        unique_together = ('chapter', 'topic')
