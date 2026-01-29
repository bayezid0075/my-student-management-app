from django.contrib import admin
from .models import Batch


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'instructor_name', 'start_date', 'end_date', 'created_at']
    list_filter = ['course', 'start_date']
    search_fields = ['name', 'instructor_name', 'course__name']
    ordering = ['-start_date']
