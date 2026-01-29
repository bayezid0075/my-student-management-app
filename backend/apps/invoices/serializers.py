from rest_framework import serializers
from .models import Invoice
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
