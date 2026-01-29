from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from apps.authentication.permissions import IsAdminOrReadOnly
from .models import Batch
from .serializers import BatchSerializer


class BatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Batch CRUD operations.
    Admin can create, update, delete.
    All authenticated users can read.
    """
    queryset = Batch.objects.select_related('course').all()
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'instructor_name', 'course__name']
    ordering_fields = ['name', 'start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by course if provided
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
