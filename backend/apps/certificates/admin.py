from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_id', 'student', 'course', 'completion_date', 'issued_at']
    list_filter = ['completion_date', 'issued_at', 'course']
    search_fields = ['certificate_id', 'student__name', 'course__name']
    ordering = ['-issued_at']
    readonly_fields = ['certificate_id', 'issued_at']
