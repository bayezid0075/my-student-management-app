from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentCourseViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')
router.register(r'enrollments', StudentCourseViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
