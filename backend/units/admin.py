"""
Admin configuration for units app.
"""
from django.contrib import admin
from .models import UnitTower, UnitBlock, Unit, UnitMembership


@admin.register(UnitTower)
class UnitTowerAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(UnitBlock)
class UnitBlockAdmin(admin.ModelAdmin):
    list_display = ['name', 'tower', 'created_at']
    list_filter = ['tower']
    search_fields = ['name', 'tower__name']


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['code', 'block', 'category', 'status', 'owner', 'tenant', 'area', 'ownership_coefficient']
    list_filter = ['category', 'status', 'block__tower']
    search_fields = ['code', 'number', 'block__name', 'block__tower__name', 'owner__username', 'tenant__username']
    fieldsets = (
        ('Información Básica', {
            'fields': ('code', 'block', 'category', 'floor', 'number', 'status')
        }),
        ('Características Físicas', {
            'fields': ('area', 'ownership_coefficient', 'bedrooms', 'bathrooms', 'parking_spaces', 'storage_rooms')
        }),
        ('Ocupantes', {
            'fields': ('owner', 'tenant')
        }),
        ('Contactos del Propietario', {
            'fields': ('owner_email', 'owner_phone', 'owner_whatsapp', 'owner_notifications')
        }),
        ('Contactos del Inquilino', {
            'fields': ('tenant_email', 'tenant_phone', 'tenant_whatsapp', 'tenant_notifications')
        }),
    )


@admin.register(UnitMembership)
class UnitMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'unit', 'role_in_unit', 'start_date', 'end_date']
    list_filter = ['role_in_unit', 'start_date']
    search_fields = ['user__first_name', 'user__last_name', 'unit__code']