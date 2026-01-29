from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.authentication.permissions import IsAdmin
from .models import Student, StudentCourse
from .serializers import StudentSerializer, StudentCourseSerializer, EnrollmentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Student CRUD operations.
    Admin only.
    """
    queryset = Student.objects.select_related('user').prefetch_related('enrollments').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'enrollment_date', 'created_at']
    ordering = ['-enrollment_date']

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Enroll a student in a course and optionally a batch.
        """
        student = self.get_object()
        serializer = EnrollmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if already enrolled
        course_id = serializer.validated_data['course_id']
        if StudentCourse.objects.filter(student=student, course_id=course_id).exists():
            return Response(
                {'error': 'Student is already enrolled in this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create enrollment
        enrollment = StudentCourse.objects.create(
            student=student,
            course_id=course_id,
            batch_id=serializer.validated_data.get('batch_id')
        )

        return Response(
            StudentCourseSerializer(enrollment).data,
            status=status.HTTP_201_CREATED
        )


class StudentCourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing student enrollments.
    Admin can view all, students can view their own.
    """
    queryset = StudentCourse.objects.select_related('student', 'course', 'batch').all()
    serializer_class = StudentCourseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__name', 'course__name']
    ordering_fields = ['enrolled_at']
    ordering = ['-enrolled_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Students can only see their own enrollments
        if user.is_student:
            try:
                student = user.student_profile
                queryset = queryset.filter(student=student)
            except Student.DoesNotExist:
                queryset = queryset.none()

        return queryset
