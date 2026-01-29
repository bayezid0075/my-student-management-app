from django.db import models
from apps.students.models import Student
from apps.courses.models import Course
from apps.batches.models import Batch
from datetime import datetime
import json


class Invoice(models.Model):
    """
    Invoice model for student course payments.
    """
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    pdf_path = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"{self.invoice_number} - {self.student.name}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number: INV-YYYY-XXXX
            year = datetime.now().year
            last_invoice = Invoice.objects.filter(
                invoice_number__startswith=f'INV-{year}'
            ).order_by('-invoice_number').first()

            if last_invoice:
                last_number = int(last_invoice.invoice_number.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.invoice_number = f'INV-{year}-{new_number:04d}'

        super().save(*args, **kwargs)


class CustomInvoice(models.Model):
    """
    Custom invoice for non-student payments.
    Allows creating invoices for any recipient with custom items.
    """
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)

    # Recipient Information
    recipient_name = models.CharField(max_length=200)
    recipient_email = models.EmailField(blank=True)
    recipient_phone = models.CharField(max_length=20, blank=True)
    recipient_address = models.TextField(blank=True)

    # Items stored as JSON: [{"name": "Item 1", "quantity": 2, "unit_price": 100.00}, ...]
    items = models.JSONField(default=list)

    # Calculated fields
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment details
    payment_date = models.DateField()
    notes = models.TextField(blank=True)

    pdf_path = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'custom_invoices'
        ordering = ['-created_at']
        verbose_name = 'Custom Invoice'
        verbose_name_plural = 'Custom Invoices'

    def __str__(self):
        return f"{self.invoice_number} - {self.recipient_name}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number: CINV-YYYY-XXXX
            year = datetime.now().year
            last_invoice = CustomInvoice.objects.filter(
                invoice_number__startswith=f'CINV-{year}'
            ).order_by('-invoice_number').first()

            if last_invoice:
                last_number = int(last_invoice.invoice_number.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.invoice_number = f'CINV-{year}-{new_number:04d}'

        # Calculate totals from items
        if self.items:
            self.subtotal = sum(
                float(item.get('quantity', 1)) * float(item.get('unit_price', 0))
                for item in self.items
            )
            self.tax_amount = float(self.subtotal) * float(self.tax_percentage) / 100
            self.total_amount = float(self.subtotal) + float(self.tax_amount) - float(self.discount)

        super().save(*args, **kwargs)
