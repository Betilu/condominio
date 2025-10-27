#!/usr/bin/env python
"""
Test script for reports module.
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from reports.models import KPI, ReportFilter, ReportTemplate
from django.contrib.auth import get_user_model

User = get_user_model()

def test_reports_models():
    """Test creating reports models."""
    print("Testing Reports Models...")
    
    # Test KPI creation
    kpi, created = KPI.objects.get_or_create(
        name='Test KPI',
        defaults={
            'description': 'Test KPI for testing',
            'category': 'general',
            'calculation_method': 'test_method',
            'target_value': 100.0,
            'current_value': 85.0,
            'unit': '%'
        }
    )
    print(f"KPI created: {created} - {kpi.name}")
    
    # Test ReportFilter creation
    filter_obj, created = ReportFilter.objects.get_or_create(
        name='test_filter',
        defaults={
            'label': 'Test Filter',
            'filter_type': 'text',
            'is_required': False,
            'report_types': ['financial']
        }
    )
    print(f"Filter created: {created} - {filter_obj.label}")
    
    # Test ReportTemplate creation
    admin_user = User.objects.filter(is_superuser=True).first()
    if admin_user:
        template, created = ReportTemplate.objects.get_or_create(
            name='Test Template',
            defaults={
                'description': 'Test template for testing',
                'report_type': 'financial',
                'template_config': {'test': True},
                'created_by': admin_user
            }
        )
        print(f"Template created: {created} - {template.name}")
    
    print("Reports models test completed successfully!")

if __name__ == '__main__':
    test_reports_models()
