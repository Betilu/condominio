"""
Management command to populate reports data.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from reports.models import KPI, ReportFilter, ReportTemplate
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate reports data with sample KPIs and filters'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample KPIs...')
        
        # Crear KPIs de muestra
        kpis_data = [
            {
                'name': 'Tasa de Cobranza Mensual',
                'description': 'Porcentaje de cobranza del mes actual',
                'category': 'financial',
                'calculation_method': 'monthly_collection_rate',
                'target_value': 95.0,
                'current_value': 87.5,
                'unit': '%'
            },
            {
                'name': 'Deuda Total',
                'description': 'Monto total de deudas pendientes',
                'category': 'financial',
                'calculation_method': 'total_debt',
                'target_value': 0.0,
                'current_value': 12500.0,
                'unit': '$'
            },
            {
                'name': 'Accesos Diarios',
                'description': 'Número de accesos registrados por día',
                'category': 'security',
                'calculation_method': 'daily_accesses',
                'target_value': 50.0,
                'current_value': 45.0,
                'unit': 'accesos'
            },
            {
                'name': 'Tasa de Ocupación de Amenidades',
                'description': 'Porcentaje de ocupación de amenidades',
                'category': 'amenities',
                'calculation_method': 'amenity_occupancy_rate',
                'target_value': 80.0,
                'current_value': 72.5,
                'unit': '%'
            },
            {
                'name': 'Órdenes de Trabajo Pendientes',
                'description': 'Número de órdenes de trabajo sin completar',
                'category': 'maintenance',
                'calculation_method': 'pending_work_orders',
                'target_value': 5.0,
                'current_value': 8.0,
                'unit': 'órdenes'
            },
            {
                'name': 'Satisfacción del Residente',
                'description': 'Puntuación promedio de satisfacción',
                'category': 'general',
                'calculation_method': 'resident_satisfaction',
                'target_value': 4.5,
                'current_value': 4.2,
                'unit': '/5'
            }
        ]
        
        for kpi_data in kpis_data:
            kpi, created = KPI.objects.get_or_create(
                name=kpi_data['name'],
                defaults=kpi_data
            )
            if created:
                self.stdout.write(f'  Created KPI: {kpi.name}')
            else:
                self.stdout.write(f'  KPI already exists: {kpi.name}')
        
        self.stdout.write('Creating sample filters...')
        
        # Crear filtros de muestra
        filters_data = [
            {
                'name': 'date_range',
                'label': 'Rango de Fechas',
                'filter_type': 'date_range',
                'is_required': True,
                'report_types': ['financial', 'security', 'amenities', 'maintenance']
            },
            {
                'name': 'unit_filter',
                'label': 'Filtrar por Unidad',
                'filter_type': 'text',
                'is_required': False,
                'report_types': ['financial', 'security', 'amenities', 'maintenance']
            },
            {
                'name': 'status_filter',
                'label': 'Estado',
                'filter_type': 'select',
                'options': ['active', 'inactive', 'pending', 'completed'],
                'is_required': False,
                'report_types': ['maintenance', 'security']
            },
            {
                'name': 'category_filter',
                'label': 'Categoría',
                'filter_type': 'select',
                'options': ['financial', 'security', 'amenities', 'maintenance'],
                'is_required': False,
                'report_types': ['financial', 'security', 'amenities', 'maintenance']
            },
            {
                'name': 'priority_filter',
                'label': 'Prioridad',
                'filter_type': 'select',
                'options': ['low', 'medium', 'high', 'urgent'],
                'is_required': False,
                'report_types': ['maintenance', 'security']
            }
        ]
        
        for filter_data in filters_data:
            filter_obj, created = ReportFilter.objects.get_or_create(
                name=filter_data['name'],
                defaults=filter_data
            )
            if created:
                self.stdout.write(f'  Created filter: {filter_obj.label}')
            else:
                self.stdout.write(f'  Filter already exists: {filter_obj.label}')
        
        self.stdout.write('Creating sample report templates...')
        
        # Obtener un usuario admin para crear las plantillas
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.first()
        
        if admin_user:
            templates_data = [
                {
                    'name': 'Reporte Ejecutivo Mensual',
                    'description': 'Resumen ejecutivo con KPIs principales del mes',
                    'report_type': 'executive',
                    'template_config': {
                        'include_kpis': True,
                        'include_charts': True,
                        'date_range': 'monthly'
                    }
                },
                {
                    'name': 'Análisis de Morosidad',
                    'description': 'Reporte detallado de deudas por antigüedad',
                    'report_type': 'financial',
                    'template_config': {
                        'aging_buckets': ['0-30', '31-60', '61-90', '90+'],
                        'include_details': True
                    }
                },
                {
                    'name': 'Estadísticas de Seguridad',
                    'description': 'Análisis de accesos e incidentes de seguridad',
                    'report_type': 'security',
                    'template_config': {
                        'include_access_stats': True,
                        'include_incidents': True,
                        'include_visitors': True
                    }
                }
            ]
            
            for template_data in templates_data:
                template, created = ReportTemplate.objects.get_or_create(
                    name=template_data['name'],
                    defaults={
                        **template_data,
                        'created_by': admin_user
                    }
                )
                if created:
                    self.stdout.write(f'  Created template: {template.name}')
                else:
                    self.stdout.write(f'  Template already exists: {template.name}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated reports data!')
        )
