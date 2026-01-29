from rest_framework import serializers
from .models import Invoice, CustomInvoice
from apps.students.serializers import StudentSerializer
from apps.courses.serializers import CourseSerializer
from apps.batches.serializers import BatchSerializer


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Invoice model.
    """
    student_details = StudentSerializer(source='student', read_only=True)
    course_details = CourseSerializer(source='course', read_only=True)
    batch_details = BatchSerializer(source='batch', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'student', 'student_details', 'course',
                  'course_details', 'batch', 'batch_details', 'amount', 'payment_date',
                  'pdf_path', 'created_at', 'updated_at']
        read_only_fields = ['id', 'invoice_number', 'pdf_path', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than 0.')
        return value

    def validate(self, data):
        batch = data.get('batch')
        course = data.get('course')
        if batch and batch.course != course:
            raise serializers.ValidationError('Batch must belong to the selected course.')
        return data


class CustomInvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for CustomInvoice model.
    Allows creating invoices for any recipient with custom items.
    """

    class Meta:
        model = CustomInvoice
        fields = [
            'id', 'invoice_number',
            'recipient_name', 'recipient_email', 'recipient_phone', 'recipient_address',
            'items', 'subtotal', 'tax_percentage', 'tax_amount', 'discount', 'total_amount',
            'payment_date', 'notes', 'pdf_path', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'subtotal', 'tax_amount', 'pdf_path', 'created_at', 'updated_at']

    def validate_items(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError('At least one item is required.')

        for i, item in enumerate(value):
            if not item.get('name'):
                raise serializers.ValidationError(f'Item {i+1}: Name is required.')
            if not item.get('quantity') or float(item.get('quantity', 0)) <= 0:
                raise serializers.ValidationError(f'Item {i+1}: Quantity must be greater than 0.')
            if not item.get('unit_price') or float(item.get('unit_price', 0)) < 0:
                raise serializers.ValidationError(f'Item {i+1}: Unit price must be 0 or greater.')

        return value

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Total amount must be greater than 0.')
        return value
