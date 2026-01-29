from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from apps.authentication.permissions import IsAdminOrReadOnly
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course CRUD operations.
    Admin can create, update, delete.
    All authenticated users can read.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'duration', 'fee', 'created_at']
    ordering = ['-created_at']
