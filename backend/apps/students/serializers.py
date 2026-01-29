from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student, StudentCourse
from apps.courses.serializers import CourseSerializer
from apps.batches.serializers import BatchSerializer

User = get_user_model()


class StudentCourseSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentCourse enrollment.
    """
    course_details = CourseSerializer(source='course', read_only=True)
    batch_details = BatchSerializer(source='batch', read_only=True)

    class Meta:
        model = StudentCourse
        fields = ['id', 'student', 'course', 'course_details', 'batch',
                  'batch_details', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']

    def validate(self, data):
        batch = data.get('batch')
        course = data.get('course')
        if batch and batch.course != course:
            raise serializers.ValidationError('Batch must belong to the selected course.')
        return data


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for Student model.
    """
    enrollments = StudentCourseSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    photo_url = serializers.SerializerMethodField()
    nid_document_url = serializers.SerializerMethodField()
    birth_certificate_document_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'name', 'email', 'phone', 'enrollment_date',
            # Personal Details
            'photo', 'photo_url', 'date_of_birth', 'gender',
            'nid_number', 'birth_certificate_number',
            # Documents
            'nid_document', 'nid_document_url',
            'birth_certificate_document', 'birth_certificate_document_url',
            # Address
            'present_address', 'permanent_address',
            # Educational Info
            'educational_qualification', 'institution_name',
            # Family Information
            'father_name', 'father_nid_number', 'father_phone',
            'mother_name', 'mother_nid_number', 'mother_phone',
            # Guardian Information
            'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_nid_number',
            # Other
            'enrollments', 'password', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        extra_kwargs = {
            'photo': {'write_only': True, 'required': False},
            'nid_document': {'write_only': True, 'required': False},
            'birth_certificate_document': {'write_only': True, 'required': False},
        }

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def get_nid_document_url(self, obj):
        if obj.nid_document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.nid_document.url)
            return obj.nid_document.url
        return None

    def get_birth_certificate_document_url(self, obj):
        if obj.birth_certificate_document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.birth_certificate_document.url)
            return obj.birth_certificate_document.url
        return None

    def create(self, validated_data):
        # Create user account for student
        password = validated_data.pop('password', None)
        if not password:
            password = 'student123'  # Default password

        # Use full email as username to ensure uniqueness
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=password,
            role=User.Role.STUDENT
        )

        student = Student.objects.create(user=user, **validated_data)
        return student

    def update(self, instance, validated_data):
        # Update student info and user email if changed
        password = validated_data.pop('password', None)
        if password:
            instance.user.set_password(password)
            instance.user.save()

        # Update user email if changed
        if validated_data.get('email') and validated_data['email'] != instance.email:
            instance.user.email = validated_data['email']
            instance.user.username = validated_data['email']
            instance.user.save()

        return super().update(instance, validated_data)


class EnrollmentSerializer(serializers.Serializer):
    """
    Serializer for enrolling a student in a course.
    """
    course_id = serializers.IntegerField()
    batch_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        from apps.courses.models import Course
        from apps.batches.models import Batch

        # Validate course exists
        try:
            course = Course.objects.get(id=data['course_id'])
        except Course.DoesNotExist:
            raise serializers.ValidationError('Course not found.')

        # Validate batch if provided
        if data.get('batch_id'):
            try:
                batch = Batch.objects.get(id=data['batch_id'])
                if batch.course != course:
                    raise serializers.ValidationError('Batch must belong to the selected course.')
            except Batch.DoesNotExist:
                raise serializers.ValidationError('Batch not found.')

        return data
