
"""
URLs for reports app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportTemplateViewSet, ReportExecutionViewSet, 
    KPIViewSet, ReportFilterViewSet, ReportsViewSet
)
from . import views

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet)
router.register(r'executions', ReportExecutionViewSet)
router.register(r'kpis', KPIViewSet)
router.register(r'filters', ReportFilterViewSet)
router.register(r'reports', ReportsViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),

    # ========== REPORTES PRINCIPALES ==========
    # Endpoint directo para exportación
    path('export_report/', views.ReportsViewSet.as_view({'get': 'export_report'}), name='export_report'),

    # ========== REPORTES AVANZADOS ==========
    path('advanced_financial_analysis/', views.ReportsViewSet.as_view({'get': 'advanced_financial_analysis'}), name='advanced_financial_analysis'),
    path('security_detailed_report/', views.ReportsViewSet.as_view({'get': 'security_detailed_report'}), name='security_detailed_report'),
    path('amenities_utilization_analysis/', views.ReportsViewSet.as_view({'get': 'amenities_utilization_analysis'}), name='amenities_utilization_analysis'),

    # ========== REPORTES DE ACCESO RÁPIDO ==========
    path('quick_financial_snapshot/', views.ReportsViewSet.as_view({'get': 'quick_financial_snapshot'}), name='quick_financial_snapshot'),
    path('quick_security_snapshot/', views.ReportsViewSet.as_view({'get': 'quick_security_snapshot'}), name='quick_security_snapshot'),
    path('quick_maintenance_snapshot/', views.ReportsViewSet.as_view({'get': 'quick_maintenance_snapshot'}), name='quick_maintenance_snapshot'),
    path('quick_amenities_snapshot/', views.ReportsViewSet.as_view({'get': 'quick_amenities_snapshot'}), name='quick_amenities_snapshot'),
]