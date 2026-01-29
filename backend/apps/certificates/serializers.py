from rest_framework import serializers
from .models import Certificate
from apps.students.serializers import StudentSerializer
from apps.courses.serializers import CourseSerializer
from apps.batches.serializers import BatchSerializer


class CertificateSerializer(serializers.ModelSerializer):
    """
    Serializer for Certificate model.
    """
    student_details = StudentSerializer(source='student', read_only=True)
    course_details = CourseSerializer(source='course', read_only=True)
    batch_details = BatchSerializer(source='batch', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'certificate_id', 'student', 'student_details', 'course',
                  'course_details', 'batch', 'batch_details', 'completion_date',
                  'pdf_path', 'issued_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'certificate_id', 'pdf_path', 'issued_at', 'created_at', 'updated_at']

    def validate(self, data):
        batch = data.get('batch')
        course = data.get('course')
        if batch and batch.course != course:
            raise serializers.ValidationError('Batch must belong to the selected course.')

        # Check if certificate already exists for this student-course combination
        student = data.get('student')
        if student and course:
            if self.instance:
                # Update case - exclude current instance
                exists = Certificate.objects.filter(
                    student=student,
                    course=course
                ).exclude(id=self.instance.id).exists()
            else:
                # Create case
                exists = Certificate.objects.filter(
                    student=student,
                    course=course
                ).exists()

            if exists:
                raise serializers.ValidationError(
                    'Certificate already exists for this student-course combination.'
                )

        return data
