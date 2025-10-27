"""
Views for maintenance app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Asset, PreventivePlan, PreventiveTask, WorkOrder, WorkOrderTask,
    Supplier, WorkOrderCost, WorkOrderAttachment
)
from .serializers import (
    AssetSerializer, PreventivePlanSerializer, PreventiveTaskSerializer,
    WorkOrderSerializer, WorkOrderTaskSerializer, SupplierSerializer,
    WorkOrderCostSerializer, WorkOrderAttachmentSerializer
)
from accounts.permissions import IsAdminUser


class AssetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assets."""
    
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['asset_type', 'status', 'manufacturer']
    search_fields = ['name', 'model', 'serial_number', 'manufacturer', 'location']
    ordering_fields = ['name', 'purchase_date', 'created_at']
    ordering = ['name']


class PreventivePlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing preventive plans."""
    
    queryset = PreventivePlan.objects.select_related('asset').all()
    serializer_class = PreventivePlanSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['frequency', 'is_active', 'asset']
    search_fields = ['name', 'description', 'asset__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['asset', 'name']


class PreventiveTaskViewSet(viewsets.ModelViewSet):
    """ViewSet for managing preventive tasks."""
    
    queryset = PreventiveTask.objects.select_related('plan__asset').all()
    serializer_class = PreventiveTaskSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_required', 'plan']
    search_fields = ['task_name', 'description', 'plan__name']
    ordering_fields = ['order', 'task_name']
    ordering = ['plan', 'order']


class WorkOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing work orders."""
    
    queryset = WorkOrder.objects.select_related(
        'asset', 'unit', 'requested_by', 'assigned_to', 'preventive_plan'
    ).all()
    serializer_class = WorkOrderSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['work_type', 'priority', 'status', 'asset', 'unit', 'requested_by', 'assigned_to']
    search_fields = ['title', 'description', 'asset__name', 'unit__code']
    ordering_fields = ['created_at', 'scheduled_date', 'priority']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Set the requested_by field to the current user."""
        serializer.save(requested_by=self.request.user)


class WorkOrderTaskViewSet(viewsets.ModelViewSet):
    """ViewSet for managing work order tasks."""
    
    queryset = WorkOrderTask.objects.select_related('work_order', 'completed_by').all()
    serializer_class = WorkOrderTaskSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_completed', 'work_order', 'completed_by']
    search_fields = ['task_name', 'description', 'work_order__title']
    ordering_fields = ['order', 'task_name']
    ordering = ['work_order', 'order']


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for managing suppliers."""
    
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'rating']
    search_fields = ['name', 'contact_person', 'phone', 'email', 'specialties']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['name']


class WorkOrderCostViewSet(viewsets.ModelViewSet):
    """ViewSet for managing work order costs."""
    
    queryset = WorkOrderCost.objects.select_related('work_order', 'supplier').all()
    serializer_class = WorkOrderCostSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['cost_type', 'work_order', 'supplier']
    search_fields = ['description', 'work_order__title', 'supplier__name', 'invoice_number']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']


class WorkOrderAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing work order attachments."""
    
    queryset = WorkOrderAttachment.objects.select_related('work_order', 'uploaded_by').all()
    serializer_class = WorkOrderAttachmentSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['work_order', 'uploaded_by']
    search_fields = ['description', 'work_order__title', 'uploaded_by__first_name']
    ordering_fields = ['uploaded_at']
    ordering = ['-uploaded_at']