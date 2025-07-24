from django.db import models


class AcademicYear(models.Model):
    start_year = models.IntegerField(null=True, blank=True)
    end_year = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'academic_year'
        constraints = [
            models.UniqueConstraint(fields=['start_date', 'end_date'],
                                    name='unique_academic_year_dates')
        ]

    def __str__(self):
        return str(self.start_date) + ' - ' + str(self.end_date)