from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ReportTemplate(models.Model):
    """
    Plantillas de reportes reutilizables
    """
    REPORT_TYPES = [
        ('financial', 'Financiero'),
        ('security', 'Seguridad'),
        ('amenities', 'Amenidades'),
        ('maintenance', 'Mantenimiento'),
        ('executive', 'Ejecutivo'),
        ('custom', 'Personalizado'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    template_config = models.JSONField(default=dict)  # Configuración de filtros, campos, etc.
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reports_template'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ReportExecution(models.Model):
    """
    Historial de ejecución de reportes
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]
    
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, null=True, blank=True)
    report_type = models.CharField(max_length=20)
    parameters = models.JSONField(default=dict)  # Parámetros de filtros usados
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_path = models.CharField(max_length=500, blank=True)  # Ruta del archivo generado
    execution_time = models.FloatField(null=True, blank=True)  # Tiempo de ejecución en segundos
    executed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    executed_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'reports_execution'
        ordering = ['-executed_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.executed_at.strftime('%Y-%m-%d %H:%M')}"


class KPI(models.Model):
    """
    Indicadores clave de rendimiento
    """
    CATEGORIES = [
        ('financial', 'Financiero'),
        ('security', 'Seguridad'),
        ('amenities', 'Amenidades'),
        ('maintenance', 'Mantenimiento'),
        ('general', 'General'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    calculation_method = models.CharField(max_length=100)  # Método de cálculo
    target_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=20, blank=True)  # %, $, unidades, etc.
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports_kpi'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class ReportFilter(models.Model):
    """
    Filtros disponibles para reportes
    """
    FILTER_TYPES = [
        ('date_range', 'Rango de Fechas'),
        ('select', 'Selección'),
        ('multi_select', 'Selección Múltiple'),
        ('text', 'Texto'),
        ('number', 'Número'),
        ('boolean', 'Sí/No'),
    ]
    
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=200)
    filter_type = models.CharField(max_length=20, choices=FILTER_TYPES)
    options = models.JSONField(default=list, blank=True)  # Opciones para select
    is_required = models.BooleanField(default=False)
    default_value = models.CharField(max_length=200, blank=True)
    report_types = models.JSONField(default=list)  # Tipos de reporte que usan este filtro
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports_filter'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.label} ({self.filter_type})"
