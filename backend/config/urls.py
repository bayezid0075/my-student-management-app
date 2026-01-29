"""
URL configuration for Student Management System.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/batches/', include('apps.batches.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/invoices/', include('apps.invoices.urls')),
    path('api/certificates/', include('apps.certificates.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
