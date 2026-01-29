from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.conf import settings
from apps.authentication.permissions import IsAdmin
from .models import Invoice, CustomInvoice
from .serializers import InvoiceSerializer, CustomInvoiceSerializer
from .pdf_generator import generate_invoice_pdf, generate_custom_invoice_pdf
import os


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Invoice CRUD operations.
    Admin can create, update, delete, and view all invoices.
    Students can only view their own invoices.
    """
    queryset = Invoice.objects.select_related('student', 'course', 'batch').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'student__name', 'course__name']
    ordering_fields = ['invoice_number', 'payment_date', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Students can only see their own invoices
        if user.is_student:
            try:
                student = user.student_profile
                queryset = queryset.filter(student=student)
            except:
                queryset = queryset.none()

        return queryset

    def perform_create(self, serializer):
        invoice = serializer.save()
        # Generate PDF after creating invoice
        pdf_path = generate_invoice_pdf(invoice)
        invoice.pdf_path = pdf_path
        invoice.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download invoice PDF.
        """
        invoice = self.get_object()

        if not invoice.pdf_path:
            # Generate PDF if it doesn't exist
            pdf_path = generate_invoice_pdf(invoice)
            invoice.pdf_path = pdf_path
            invoice.save()

        # Get full file path
        file_path = os.path.join(settings.MEDIA_ROOT, invoice.pdf_path)

        if not os.path.exists(file_path):
            return Response(
                {'error': 'PDF file not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return file
        return FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
            as_attachment=True,
            filename=f'invoice_{invoice.invoice_number}.pdf'
        )


class CustomInvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Custom Invoice CRUD operations.
    Admin only - for creating invoices to any recipient with custom items.
    """
    queryset = CustomInvoice.objects.all()
    serializer_class = CustomInvoiceSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'recipient_name', 'recipient_email']
    ordering_fields = ['invoice_number', 'payment_date', 'created_at', 'total_amount']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        invoice = serializer.save()
        # Generate PDF after creating invoice
        pdf_path = generate_custom_invoice_pdf(invoice)
        invoice.pdf_path = pdf_path
        invoice.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download custom invoice PDF.
        """
        invoice = self.get_object()

        if not invoice.pdf_path:
            # Generate PDF if it doesn't exist
            pdf_path = generate_custom_invoice_pdf(invoice)
            invoice.pdf_path = pdf_path
            invoice.save()

        # Get full file path
        file_path = os.path.join(settings.MEDIA_ROOT, invoice.pdf_path)

        if not os.path.exists(file_path):
            return Response(
                {'error': 'PDF file not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return file
        return FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
            as_attachment=True,
            filename=f'invoice_{invoice.invoice_number}.pdf'
        )
