from django.db import models
from apps.students.models import Student
from apps.courses.models import Course
from apps.batches.models import Batch
from datetime import datetime


class Certificate(models.Model):
    """
    Certificate model for course completion certificates.
    """
    certificate_id = models.CharField(max_length=50, unique=True, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='certificates'
    )
    completion_date = models.DateField()
    pdf_path = models.CharField(max_length=500, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'certificates'
        unique_together = ['student', 'course']
        ordering = ['-issued_at']
        verbose_name = 'Certificate'
        verbose_name_plural = 'Certificates'

    def __str__(self):
        return f"{self.certificate_id} - {self.student.name}"

    def save(self, *args, **kwargs):
        if not self.certificate_id:
            # Generate certificate ID: CERT-YYYY-XXXX
            year = datetime.now().year
            last_cert = Certificate.objects.filter(
                certificate_id__startswith=f'CERT-{year}'
            ).order_by('-certificate_id').first()

            if last_cert:
                last_number = int(last_cert.certificate_id.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.certificate_id = f'CERT-{year}-{new_number:04d}'

        super().save(*args, **kwargs)
