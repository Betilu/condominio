"""
Serializers for maintenance app.
"""
from rest_framework import serializers
from .models import (
    Asset, PreventivePlan, PreventiveTask, WorkOrder, WorkOrderTask,
    Supplier, WorkOrderCost, WorkOrderAttachment
)


class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model."""
    
    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'asset_type', 'location', 'model', 'serial_number',
            'manufacturer', 'purchase_date', 'warranty_end_date', 'status',
            'description', 'technical_specs', 'manual_file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PreventivePlanSerializer(serializers.ModelSerializer):
    """Serializer for PreventivePlan model."""
    
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    
    class Meta:
        model = PreventivePlan
        fields = [
            'id', 'asset', 'asset_name', 'name', 'description', 'frequency',
            'frequency_value', 'estimated_duration', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PreventiveTaskSerializer(serializers.ModelSerializer):
    """Serializer for PreventiveTask model."""
    
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    asset_name = serializers.CharField(source='plan.asset.name', read_only=True)
    
    class Meta:
        model = PreventiveTask
        fields = [
            'id', 'plan', 'plan_name', 'asset_name', 'task_name', 'description',
            'order', 'is_required', 'estimated_duration'
        ]


class WorkOrderSerializer(serializers.ModelSerializer):
    """Serializer for WorkOrder model."""
    
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    preventive_plan_name = serializers.CharField(source='preventive_plan.name', read_only=True)
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'title', 'description', 'work_type', 'priority', 'status',
            'asset', 'asset_name', 'unit', 'unit_code', 'requested_by', 'requested_by_name',
            'assigned_to', 'assigned_to_name', 'preventive_plan', 'preventive_plan_name',
            'location', 'scheduled_date', 'started_at', 'completed_at',
            'estimated_hours', 'actual_hours', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'requested_by']


class WorkOrderTaskSerializer(serializers.ModelSerializer):
    """Serializer for WorkOrderTask model."""
    
    work_order_title = serializers.CharField(source='work_order.title', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)
    
    class Meta:
        model = WorkOrderTask
        fields = [
            'id', 'work_order', 'work_order_title', 'task_name', 'description',
            'is_completed', 'completed_at', 'completed_by', 'completed_by_name', 'notes'
        ]


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model."""
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'phone', 'email', 'address',
            'category', 'specialties', 'services', 'notes', 'is_active', 'rating', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class WorkOrderCostSerializer(serializers.ModelSerializer):
    """Serializer for WorkOrderCost model."""
    
    work_order_title = serializers.CharField(source='work_order.title', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = WorkOrderCost
        fields = [
            'id', 'work_order', 'work_order_title', 'cost_type', 'description',
            'quantity', 'unit_price', 'total_amount', 'supplier', 'supplier_name',
            'invoice_number', 'created_at'
        ]
        read_only_fields = ['created_at', 'total_amount']


class WorkOrderAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for WorkOrderAttachment model."""
    
    work_order_title = serializers.CharField(source='work_order.title', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = WorkOrderAttachment
        fields = [
            'id', 'work_order', 'work_order_title', 'file', 'description',
            'uploaded_by', 'uploaded_by_name', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_at']