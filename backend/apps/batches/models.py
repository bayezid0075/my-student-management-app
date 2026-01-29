from django.db import models
from apps.courses.models import Course


class Batch(models.Model):
    """
    Batch model representing course batches.
    """
    name = models.CharField(max_length=200)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='batches'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    instructor_name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'batches'
        ordering = ['-start_date']
        verbose_name = 'Batch'
        verbose_name_plural = 'Batches'

    def __str__(self):
        return f"{self.name} - {self.course.name}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError('End date must be after start date.')
