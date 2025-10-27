"""
URL configuration for amenities app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AmenityViewSet, AmenityScheduleViewSet, AmenityRateViewSet,
    AmenityReservationViewSet, AmenityBlackoutViewSet, AmenityUsageViewSet
)

router = DefaultRouter()
router.register(r'amenities', AmenityViewSet)
router.register(r'amenity-schedules', AmenityScheduleViewSet)
router.register(r'amenity-rates', AmenityRateViewSet)
router.register(r'amenity-reservations', AmenityReservationViewSet)
router.register(r'amenity-blackouts', AmenityBlackoutViewSet)
router.register(r'amenity-usage', AmenityUsageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]