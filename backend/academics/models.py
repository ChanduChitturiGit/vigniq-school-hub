from django.db import models
from core.models import AbstractAcademicYear

class SchoolAcademicYear(AbstractAcademicYear):

    class Meta:
        db_table = 'academic_year'
        constraints = [
            models.UniqueConstraint(fields=['start_date', 'end_date'],
                                    name='unique_academic_year_dates')
        ]
