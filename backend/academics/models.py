from django.db import models


class AcademicYear(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'academic_year'

    def __str__(self):
        return self.start_date.strftime('%Y') + ' - ' + self.end_date.strftime('%Y')