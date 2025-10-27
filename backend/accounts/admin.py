"""
Admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import UserRole, PasswordResetToken

User = get_user_model()


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    filter_horizontal = ['permissions']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'used']
    list_filter = ['used', 'created_at', 'expires_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['token', 'created_at']
    date_hierarchy = 'created_at'


class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model."""
    
    list_display = [
        'username', 'email', 'first_name', 'last_name', 'is_resident', 
        'custom_role', 'two_factor_enabled', 'is_active'
    ]
    list_filter = [
        'is_resident', 'is_active', 'two_factor_enabled', 'groups', 
        'custom_role', 'email_notifications', 'whatsapp_notifications'
    ]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'document_number', 'phone']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información Personal', {
            'fields': ('phone', 'document_number', 'is_resident')
        }),
        ('Preferencias de Contacto', {
            'fields': (
                'email_notifications', 'whatsapp_notifications', 
                'whatsapp_number'
            )
        }),
        ('Seguridad', {
            'fields': (
                'two_factor_enabled', 'last_password_change', 
                'failed_login_attempts', 'locked_until'
            )
        }),
        ('Rol Personalizado', {
            'fields': ('custom_role',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Información Personal', {
            'fields': (
                'email', 'first_name', 'last_name', 'phone', 
                'document_number', 'is_resident'
            )
        }),
        ('Preferencias de Contacto', {
            'fields': (
                'email_notifications', 'whatsapp_notifications', 
                'whatsapp_number'
            )
        }),
        ('Rol Personalizado', {
            'fields': ('custom_role',)
        }),
    )
    
    readonly_fields = ['last_password_change', 'failed_login_attempts']


# Register the custom User admin
admin.site.register(User, UserAdmin)