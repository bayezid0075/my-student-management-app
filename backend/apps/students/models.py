from django.db import models
from apps.authentication.models import User
from apps.courses.models import Course
from apps.batches.models import Batch


def student_image_path(instance, filename):
    return f'students/{instance.id}/photo/{filename}'


def student_document_path(instance, filename):
    return f'students/{instance.id}/documents/{filename}'


class Student(models.Model):
    """
    Student model representing students in the system.
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    EDUCATION_CHOICES = [
        ('PSC', 'Primary School Certificate (PSC)'),
        ('JSC', 'Junior School Certificate (JSC)'),
        ('SSC', 'Secondary School Certificate (SSC)'),
        ('HSC', 'Higher Secondary Certificate (HSC)'),
        ('DIPLOMA', 'Diploma'),
        ('BACHELORS', 'Bachelor\'s Degree'),
        ('MASTERS', 'Master\'s Degree'),
        ('PHD', 'PhD'),
        ('OTHER', 'Other'),
    ]

    # Basic Info
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)

    # Personal Details
    photo = models.ImageField(upload_to=student_image_path, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    nid_number = models.CharField(max_length=20, null=True, blank=True, verbose_name='NID Number')
    birth_certificate_number = models.CharField(max_length=30, null=True, blank=True)

    # Documents
    nid_document = models.FileField(upload_to=student_document_path, null=True, blank=True, verbose_name='NID Document')
    birth_certificate_document = models.FileField(upload_to=student_document_path, null=True, blank=True)

    # Address
    present_address = models.TextField(null=True, blank=True)
    permanent_address = models.TextField(null=True, blank=True)

    # Educational Info
    educational_qualification = models.CharField(
        max_length=20,
        choices=EDUCATION_CHOICES,
        null=True,
        blank=True
    )
    institution_name = models.CharField(max_length=200, null=True, blank=True)

    # Family Information
    father_name = models.CharField(max_length=200, null=True, blank=True)
    father_nid_number = models.CharField(max_length=20, null=True, blank=True)
    father_phone = models.CharField(max_length=20, null=True, blank=True)

    mother_name = models.CharField(max_length=200, null=True, blank=True)
    mother_nid_number = models.CharField(max_length=20, null=True, blank=True)
    mother_phone = models.CharField(max_length=20, null=True, blank=True)

    # Guardian Information
    guardian_name = models.CharField(max_length=200, null=True, blank=True)
    guardian_relation = models.CharField(max_length=50, null=True, blank=True)
    guardian_phone = models.CharField(max_length=20, null=True, blank=True)
    guardian_nid_number = models.CharField(max_length=20, null=True, blank=True)

    # Enrollment
    enrollment_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['-enrollment_date']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.name} ({self.email})"


class StudentCourse(models.Model):
    """
    Many-to-many through table for Student and Course relationship.
    """
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='student_enrollments'
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_enrollments'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_courses'
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']
        verbose_name = 'Student Course Enrollment'
        verbose_name_plural = 'Student Course Enrollments'

    def __str__(self):
        return f"{self.student.name} - {self.course.name}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.batch and self.batch.course != self.course:
            raise ValidationError('Batch must belong to the selected course.')
