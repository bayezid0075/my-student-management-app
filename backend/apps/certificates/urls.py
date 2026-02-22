from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CertificateViewSet, CertificateVerifyView

router = DefaultRouter()
router.register(r'', CertificateViewSet, basename='certificate')

urlpatterns = [
    # Public verification endpoint — no auth required
    path('verify/', CertificateVerifyView.as_view(), name='certificate-verify'),
    path('', include(router.urls)),
]
