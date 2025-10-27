"""
Admin configuration for notices app.
"""
from django.contrib import admin
from .models import Notice, NoticeReadConfirmation


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ['title', 'audience_scope', 'priority', 'publish_at', 'expire_at', 'requires_confirmation', 'created_by']
    list_filter = ['audience_scope', 'priority', 'requires_confirmation', 'publish_at', 'created_by']
    search_fields = ['title', 'body']
    date_hierarchy = 'publish_at'
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'body', 'priority')
        }),
        ('Audiencia', {
            'fields': ('audience_scope', 'target_tower', 'target_block', 'target_unit')
        }),
        ('Programación', {
            'fields': ('publish_at', 'expire_at')
        }),
        ('Archivos', {
            'fields': ('image', 'attachment')
        }),
        ('Configuración', {
            'fields': ('requires_confirmation', 'created_by')
        }),
    )


@admin.register(NoticeReadConfirmation)
class NoticeReadConfirmationAdmin(admin.ModelAdmin):
    list_display = ['notice', 'user', 'read_at', 'ip_address']
    list_filter = ['read_at', 'notice__audience_scope']
    search_fields = ['notice__title', 'user__username', 'user__first_name', 'user__last_name']
    date_hierarchy = 'read_at'
    readonly_fields = ['read_at']