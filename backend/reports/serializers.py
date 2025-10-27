"""
Serializers for reports app.
"""
from rest_framework import serializers
from .models import ReportTemplate, ReportExecution, KPI, ReportFilter


class ReportFilterSerializer(serializers.ModelSerializer):
    """Serializer for ReportFilter model."""
    
    class Meta:
        model = ReportFilter
        fields = [
            'id', 'name', 'label', 'filter_type', 'options', 'is_required',
            'default_value', 'report_types', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ReportTemplate model."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type', 'template_config',
            'is_active', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ReportExecutionSerializer(serializers.ModelSerializer):
    """Serializer for ReportExecution model."""
    
    executed_by_name = serializers.CharField(source='executed_by.get_full_name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = ReportExecution
        fields = [
            'id', 'template', 'template_name', 'report_type', 'parameters', 'status',
            'file_path', 'execution_time', 'executed_by', 'executed_by_name',
            'executed_at', 'completed_at', 'error_message'
        ]
        read_only_fields = ['executed_at', 'completed_at']


class KPISerializer(serializers.ModelSerializer):
    """Serializer for KPI model."""
    
    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'description', 'category', 'calculation_method',
            'target_value', 'current_value', 'unit', 'is_active',
            'last_updated', 'created_at'
        ]
        read_only_fields = ['last_updated', 'created_at']
