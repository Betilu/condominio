"""
Admin configuration for amenities app.
"""
from django.contrib import admin
from .models import (
    Amenity, AmenitySchedule, AmenityRate, AmenityReservation,
    AmenityBlackout, AmenityUsage
)


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'amenity_type', 'capacity', 'location', 'is_active', 'requires_approval']
    list_filter = ['amenity_type', 'is_active', 'requires_approval']
    search_fields = ['name', 'description', 'location']
    date_hierarchy = 'created_at'


@admin.register(AmenitySchedule)
class AmenityScheduleAdmin(admin.ModelAdmin):
    list_display = ['amenity', 'day_of_week', 'start_time', 'end_time', 'is_active']
    list_filter = ['day_of_week', 'is_active', 'amenity__amenity_type']
    search_fields = ['amenity__name']


@admin.register(AmenityRate)
class AmenityRateAdmin(admin.ModelAdmin):
    list_display = ['amenity', 'rate_type', 'amount', 'start_time', 'end_time', 'is_active', 'effective_date']
    list_filter = ['rate_type', 'is_active', 'amenity__amenity_type', 'effective_date']
    search_fields = ['amenity__name']


@admin.register(AmenityReservation)
class AmenityReservationAdmin(admin.ModelAdmin):
    list_display = ['amenity', 'unit', 'user', 'reservation_date', 'start_time', 'end_time', 'status', 'total_amount']
    list_filter = ['status', 'reservation_date', 'amenity__amenity_type']
    search_fields = ['amenity__name', 'unit__code', 'user__first_name', 'user__last_name']
    date_hierarchy = 'reservation_date'


@admin.register(AmenityBlackout)
class AmenityBlackoutAdmin(admin.ModelAdmin):
    list_display = ['amenity', 'start_date', 'end_date', 'reason']
    list_filter = ['start_date', 'end_date', 'amenity__amenity_type']
    search_fields = ['amenity__name', 'reason', 'description']
    date_hierarchy = 'start_date'


@admin.register(AmenityUsage)
class AmenityUsageAdmin(admin.ModelAdmin):
    list_display = ['reservation', 'actual_start_time', 'actual_end_time', 'actual_guests_count', 'checked_in_by']
    list_filter = ['actual_start_time', 'checked_in_by']
    search_fields = ['reservation__amenity__name', 'reservation__unit__code']
    date_hierarchy = 'created_at'