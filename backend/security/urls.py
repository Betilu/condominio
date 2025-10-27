"""
URL configuration for security app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    VisitorViewSet, AccessAuthorizationViewSet, AccessEventViewSet,
    SecurityGuardViewSet, SecurityIncidentViewSet, VisitorFaceEncodingViewSet,
    VisitorAttendanceViewSet
)

router = DefaultRouter()
router.register(r'visitors', VisitorViewSet)
router.register(r'access-authorizations', AccessAuthorizationViewSet)
router.register(r'access-events', AccessEventViewSet)
router.register(r'security-guards', SecurityGuardViewSet)
router.register(r'security-incidents', SecurityIncidentViewSet)
router.register(r'face-encodings', VisitorFaceEncodingViewSet)
router.register(r'attendance', VisitorAttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]