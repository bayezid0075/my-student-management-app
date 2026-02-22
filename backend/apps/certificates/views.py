from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.http import FileResponse
from django.conf import settings
from apps.authentication.permissions import IsAdmin
from .models import Certificate
from .serializers import CertificateSerializer, CertificateVerifySerializer
from .pdf_generator import generate_certificate_pdf
import os


class CertificateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Certificate CRUD operations.
    Admin can create, update, delete, and view all certificates.
    Students can only view their own certificates.
    """
    queryset = Certificate.objects.select_related('student', 'course', 'batch').all()
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['certificate_id', 'student__name', 'course__name']
    ordering_fields = ['certificate_id', 'completion_date', 'issued_at']
    ordering = ['-issued_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Students can only see their own certificates
        if user.is_student:
            try:
                student = user.student_profile
                queryset = queryset.filter(student=student)
            except:
                queryset = queryset.none()

        return queryset

    def perform_create(self, serializer):
        certificate = serializer.save()
        # Generate PDF after creating certificate
        pdf_path = generate_certificate_pdf(certificate)
        certificate.pdf_path = pdf_path
        certificate.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download certificate PDF.
        """
        certificate = self.get_object()

        if not certificate.pdf_path:
            # Generate PDF if it doesn't exist
            pdf_path = generate_certificate_pdf(certificate)
            certificate.pdf_path = pdf_path
            certificate.save()

        # Get full file path
        file_path = os.path.join(settings.MEDIA_ROOT, certificate.pdf_path)

        if not os.path.exists(file_path):
            return Response(
                {'error': 'PDF file not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return file
        return FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
            as_attachment=True,
            filename=f'certificate_{certificate.certificate_id}.pdf'
        )


class CertificateVerifyView(APIView):
    """
    Public endpoint — no authentication required.
    GET /api/certificates/verify/?certificate_id=CERT-2026-0001

    Returns certificate authenticity, course details, and student
    course-related information for the given certificate number.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        certificate_id = request.query_params.get('certificate_id', '').strip().upper()

        if not certificate_id:
            return Response(
                {'valid': False, 'error': 'Certificate ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            certificate = Certificate.objects.select_related(
                'student', 'course', 'batch'
            ).get(certificate_id=certificate_id)
        except Certificate.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'No certificate found with that ID. Please check and try again.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CertificateVerifySerializer(certificate, context={'request': request})
        return Response({'valid': True, 'certificate': serializer.data})
