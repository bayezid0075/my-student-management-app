from rest_framework import serializers
from .models import Batch
from apps.courses.serializers import CourseSerializer


class BatchSerializer(serializers.ModelSerializer):
    """
    Serializer for Batch model.
    """
    course_details = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = Batch
        fields = ['id', 'name', 'course', 'course_details', 'start_date',
                  'end_date', 'instructor_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError('End date must be after start date.')
        return data
