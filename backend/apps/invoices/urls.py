from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, CustomInvoiceViewSet

router = DefaultRouter()
router.register(r'student', InvoiceViewSet, basename='invoice')
router.register(r'custom', CustomInvoiceViewSet, basename='custom-invoice')

urlpatterns = [
    path('', include(router.urls)),
]
