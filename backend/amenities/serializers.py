"""
Serializers for amenities app.
"""
from rest_framework import serializers
from .models import (
    Amenity, AmenitySchedule, AmenityRate, AmenityReservation,
    AmenityBlackout, AmenityUsage
)


class AmenitySerializer(serializers.ModelSerializer):
    """Serializer for Amenity model."""
    
    class Meta:
        model = Amenity
        fields = [
            'id', 'name', 'amenity_type', 'description', 'capacity', 'location',
            'is_active', 'requires_approval', 'advance_booking_days', 'max_booking_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AmenityScheduleSerializer(serializers.ModelSerializer):
    """Serializer for AmenitySchedule model."""
    
    amenity_name = serializers.CharField(source='amenity.name', read_only=True)
    
    class Meta:
        model = AmenitySchedule
        fields = [
            'id', 'amenity', 'amenity_name', 'day_of_week', 'start_time',
            'end_time', 'is_active'
        ]


class AmenityRateSerializer(serializers.ModelSerializer):
    """Serializer for AmenityRate model."""
    
    amenity_name = serializers.CharField(source='amenity.name', read_only=True)
    
    class Meta:
        model = AmenityRate
        fields = [
            'id', 'amenity', 'amenity_name', 'rate_type', 'amount',
            'start_time', 'end_time', 'is_active', 'effective_date'
        ]


class AmenityReservationSerializer(serializers.ModelSerializer):
    """Serializer for AmenityReservation model."""
    
    amenity_name = serializers.CharField(source='amenity.name', read_only=True)
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = AmenityReservation
        fields = [
            'id', 'amenity', 'amenity_name', 'unit', 'unit_code', 'user', 'user_name',
            'reservation_date', 'start_time', 'end_time', 'status', 'total_amount',
            'paid_amount', 'guests_count', 'special_requirements', 'notes',
            'duration_hours', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'duration_hours']


class AmenityBlackoutSerializer(serializers.ModelSerializer):
    """Serializer for AmenityBlackout model."""
    
    amenity_name = serializers.CharField(source='amenity.name', read_only=True)
    
    class Meta:
        model = AmenityBlackout
        fields = [
            'id', 'amenity', 'amenity_name', 'start_date', 'end_date',
            'reason', 'description', 'created_at'
        ]
        read_only_fields = ['created_at']


class AmenityUsageSerializer(serializers.ModelSerializer):
    """Serializer for AmenityUsage model."""
    
    amenity_name = serializers.CharField(source='reservation.amenity.name', read_only=True)
    unit_code = serializers.CharField(source='reservation.unit.code', read_only=True)
    checked_in_by_name = serializers.CharField(source='checked_in_by.get_full_name', read_only=True)
    
    class Meta:
        model = AmenityUsage
        fields = [
            'id', 'reservation', 'amenity_name', 'unit_code', 'actual_start_time',
            'actual_end_time', 'actual_guests_count', 'notes', 'checked_in_by',
            'checked_in_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']