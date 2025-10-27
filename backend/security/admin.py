"""
Admin configuration for security app.
"""
from django.contrib import admin
from .models import (
    Visitor, AccessAuthorization, AccessEvent, 
    SecurityGuard, SecurityIncident
)


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'document_number', 'phone', 'is_blacklisted', 'created_at']
    list_filter = ['is_blacklisted', 'document_type', 'created_at']
    search_fields = ['first_name', 'last_name', 'document_number', 'phone']
    date_hierarchy = 'created_at'


@admin.register(AccessAuthorization)
class AccessAuthorizationAdmin(admin.ModelAdmin):
    list_display = ['visitor', 'unit', 'status', 'start_date', 'end_date', 'authorized_by']
    list_filter = ['status', 'start_date', 'end_date']
    search_fields = ['visitor__first_name', 'visitor__last_name', 'unit__code']
    date_hierarchy = 'created_at'


@admin.register(AccessEvent)
class AccessEventAdmin(admin.ModelAdmin):
    list_display = ['visitor', 'event_type', 'detection_type', 'timestamp', 'camera_location']
    list_filter = ['event_type', 'detection_type', 'timestamp']
    search_fields = ['visitor__first_name', 'visitor__last_name', 'camera_location']
    date_hierarchy = 'timestamp'


@admin.register(SecurityGuard)
class SecurityGuardAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'shift_start', 'shift_end', 'is_active']
    list_filter = ['is_active', 'shift_start', 'shift_end']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']


@admin.register(SecurityIncident)
class SecurityIncidentAdmin(admin.ModelAdmin):
    list_display = ['incident_type', 'severity', 'location', 'incident_date', 'status', 'reported_by']
    list_filter = ['incident_type', 'severity', 'status', 'incident_date']
    search_fields = ['description', 'location', 'reported_by__first_name']
    date_hierarchy = 'incident_date'