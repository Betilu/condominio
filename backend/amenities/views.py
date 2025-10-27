"""
Views for amenities app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Amenity, AmenitySchedule, AmenityRate, AmenityReservation,
    AmenityBlackout, AmenityUsage
)
from .serializers import (
    AmenitySerializer, AmenityScheduleSerializer, AmenityRateSerializer,
    AmenityReservationSerializer, AmenityBlackoutSerializer, AmenityUsageSerializer
)
from accounts.permissions import IsAdminUser


class AmenityViewSet(viewsets.ModelViewSet):
    """ViewSet for managing amenities."""
    
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['amenity_type', 'is_active', 'requires_approval']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AmenityScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing amenity schedules."""
    
    queryset = AmenitySchedule.objects.select_related('amenity').all()
    serializer_class = AmenityScheduleSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['day_of_week', 'is_active', 'amenity']
    search_fields = ['amenity__name']
    ordering_fields = ['day_of_week', 'start_time']
    ordering = ['amenity', 'day_of_week', 'start_time']


class AmenityRateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing amenity rates."""
    
    queryset = AmenityRate.objects.select_related('amenity').all()
    serializer_class = AmenityRateSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rate_type', 'is_active', 'amenity']
    search_fields = ['amenity__name']
    ordering_fields = ['amenity', 'effective_date', 'amount']
    ordering = ['amenity', 'effective_date']


class AmenityReservationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing amenity reservations."""
    
    queryset = AmenityReservation.objects.select_related(
        'amenity', 'unit', 'user'
    ).all()
    serializer_class = AmenityReservationSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'amenity', 'unit', 'user', 'reservation_date']
    search_fields = ['amenity__name', 'unit__code', 'user__first_name', 'user__last_name']
    ordering_fields = ['reservation_date', 'start_time', 'created_at']
    ordering = ['-reservation_date', 'start_time']


class AmenityBlackoutViewSet(viewsets.ModelViewSet):
    """ViewSet for managing amenity blackouts."""
    
    queryset = AmenityBlackout.objects.select_related('amenity').all()
    serializer_class = AmenityBlackoutSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['amenity', 'start_date', 'end_date']
    search_fields = ['amenity__name', 'reason', 'description']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class AmenityUsageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing amenity usage."""
    
    queryset = AmenityUsage.objects.select_related(
        'reservation', 'checked_in_by'
    ).all()
    serializer_class = AmenityUsageSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['checked_in_by', 'actual_start_time']
    search_fields = ['reservation__amenity__name', 'reservation__unit__code']
    ordering_fields = ['actual_start_time', 'created_at']
    ordering = ['-actual_start_time']