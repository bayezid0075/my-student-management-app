from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'student', 'course', 'amount', 'payment_date', 'created_at']
    list_filter = ['payment_date', 'created_at', 'course']
    search_fields = ['invoice_number', 'student__name', 'course__name']
    ordering = ['-created_at']
    readonly_fields = ['invoice_number']
