from django.db import models
from apps.authentication.models import User
from apps.courses.models import Course
from apps.batches.models import Batch


class Student(models.Model):
    """
    Student model representing students in the system.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
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
