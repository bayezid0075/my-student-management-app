from django.contrib import admin
from .models import Student, StudentCourse


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'enrollment_date', 'created_at']
    list_filter = ['enrollment_date', 'created_at']
    search_fields = ['name', 'email', 'phone']
    ordering = ['-enrollment_date']


@admin.register(StudentCourse)
class StudentCourseAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'batch', 'enrolled_at']
    list_filter = ['course', 'batch', 'enrolled_at']
    search_fields = ['student__name', 'course__name']
    ordering = ['-enrolled_at']
