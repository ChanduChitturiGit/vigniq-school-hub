from django.db import models
from core.models import AbstractAcademicYear

class SchoolAcademicYear(AbstractAcademicYear):

    class Meta:
        db_table = 'academic_year'
        constraints = [
            models.UniqueConstraint(fields=['start_year', 'end_year'],
                                    name='unique_academic_year_dates')
        ]
