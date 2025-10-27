"""
Admin configuration for maintenance app.
"""
from django.contrib import admin
from .models import (
    Asset, PreventivePlan, PreventiveTask, WorkOrder, WorkOrderTask,
    Supplier, WorkOrderCost, WorkOrderAttachment
)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset_type', 'location', 'status', 'purchase_date', 'warranty_end_date']
    list_filter = ['asset_type', 'status', 'purchase_date', 'warranty_end_date']
    search_fields = ['name', 'model', 'serial_number', 'manufacturer', 'location']
    date_hierarchy = 'created_at'


@admin.register(PreventivePlan)
class PreventivePlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset', 'frequency', 'frequency_value', 'estimated_duration', 'is_active']
    list_filter = ['frequency', 'is_active', 'asset__asset_type']
    search_fields = ['name', 'description', 'asset__name']
    date_hierarchy = 'created_at'


@admin.register(PreventiveTask)
class PreventiveTaskAdmin(admin.ModelAdmin):
    list_display = ['task_name', 'plan', 'order', 'is_required', 'estimated_duration']
    list_filter = ['is_required', 'plan__asset__asset_type']
    search_fields = ['task_name', 'description', 'plan__name']
    ordering = ['plan', 'order']


@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'work_type', 'priority', 'status', 'asset', 'unit', 'requested_by', 'assigned_to', 'created_at']
    list_filter = ['work_type', 'priority', 'status', 'created_at', 'scheduled_date']
    search_fields = ['title', 'description', 'asset__name', 'unit__code', 'requested_by__first_name']
    date_hierarchy = 'created_at'
    raw_id_fields = ['asset', 'unit', 'requested_by', 'assigned_to']


@admin.register(WorkOrderTask)
class WorkOrderTaskAdmin(admin.ModelAdmin):
    list_display = ['task_name', 'work_order', 'is_completed', 'completed_at', 'completed_by']
    list_filter = ['is_completed', 'completed_at']
    search_fields = ['task_name', 'description', 'work_order__title']
    ordering = ['work_order', 'id']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone', 'email', 'rating', 'is_active']
    list_filter = ['is_active', 'rating']
    search_fields = ['name', 'contact_person', 'phone', 'email', 'specialties']
    date_hierarchy = 'created_at'


@admin.register(WorkOrderCost)
class WorkOrderCostAdmin(admin.ModelAdmin):
    list_display = ['work_order', 'cost_type', 'description', 'quantity', 'unit_price', 'total_amount', 'supplier']
    list_filter = ['cost_type', 'supplier', 'created_at']
    search_fields = ['description', 'work_order__title', 'supplier__name', 'invoice_number']
    date_hierarchy = 'created_at'


@admin.register(WorkOrderAttachment)
class WorkOrderAttachmentAdmin(admin.ModelAdmin):
    list_display = ['work_order', 'file', 'description', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['work_order__title', 'description', 'uploaded_by__first_name']
    date_hierarchy = 'uploaded_at'