from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model.
    """
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'duration', 'fee', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError('Duration must be greater than 0.')
        return value

    def validate_fee(self, value):
        if value < 0:
            raise serializers.ValidationError('Fee cannot be negative.')
        return value
