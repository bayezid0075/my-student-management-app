from rest_framework import serializers
from .models import Certificate
from apps.students.serializers import StudentSerializer
from apps.courses.serializers import CourseSerializer
from apps.batches.serializers import BatchSerializer


class CertificateVerifySerializer(serializers.ModelSerializer):
    """
    Public serializer for certificate verification.
    Exposes only non-sensitive details needed to confirm authenticity.
    """
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_photo = serializers.SerializerMethodField()
    student_enrollment_date = serializers.DateField(source='student.enrollment_date', read_only=True)
    student_gender = serializers.CharField(source='student.get_gender_display', read_only=True)

    course_name = serializers.CharField(source='course.name', read_only=True)
    course_description = serializers.CharField(source='course.description', read_only=True)
    course_duration = serializers.IntegerField(source='course.duration', read_only=True)
    course_status = serializers.CharField(source='course.status', read_only=True)
    course_fee = serializers.DecimalField(source='course.fee', max_digits=10, decimal_places=2, read_only=True)

    batch_name = serializers.SerializerMethodField()
    batch_start_date = serializers.SerializerMethodField()
    batch_end_date = serializers.SerializerMethodField()
    batch_instructor = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'certificate_id',
            'completion_date',
            'issued_at',
            # Student (public-safe fields only)
            'student_name',
            'student_photo',
            'student_enrollment_date',
            'student_gender',
            # Course
            'course_name',
            'course_description',
            'course_duration',
            'course_status',
            'course_fee',
            # Batch (optional)
            'batch_name',
            'batch_start_date',
            'batch_end_date',
            'batch_instructor',
        ]

    def get_student_photo(self, obj):
        if obj.student.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.student.photo.url)
            return obj.student.photo.url
        return None

    def get_batch_name(self, obj):
        return obj.batch.name if obj.batch else None

    def get_batch_start_date(self, obj):
        return obj.batch.start_date if obj.batch else None

    def get_batch_end_date(self, obj):
        return obj.batch.end_date if obj.batch else None

    def get_batch_instructor(self, obj):
        return obj.batch.instructor_name if obj.batch else None


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
