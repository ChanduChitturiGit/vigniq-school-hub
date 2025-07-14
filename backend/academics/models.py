from django.db import models


class AcademicYear(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'academic_year'
        constraints = [
            models.UniqueConstraint(fields=['start_date', 'end_date'],
                                    name='unique_academic_year_dates')
        ]

    def __str__(self):
        return self.start_date.strftime('%Y') + ' - ' + self.end_date.strftime('%Y')