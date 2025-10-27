"""
URL configuration for maintenance app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AssetViewSet, PreventivePlanViewSet, PreventiveTaskViewSet,
    WorkOrderViewSet, WorkOrderTaskViewSet, SupplierViewSet,
    WorkOrderCostViewSet, WorkOrderAttachmentViewSet
)

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'preventive-plans', PreventivePlanViewSet)
router.register(r'preventive-tasks', PreventiveTaskViewSet)
router.register(r'work-orders', WorkOrderViewSet)
router.register(r'work-order-tasks', WorkOrderTaskViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'work-order-costs', WorkOrderCostViewSet)
router.register(r'work-order-attachments', WorkOrderAttachmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]