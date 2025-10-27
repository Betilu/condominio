from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()


class Asset(models.Model):
    """
    Activos del condominio (ascensores, bombas, etc.)
    """
    ASSET_TYPES = [
        ('elevator', 'Ascensor'),
        ('pump', 'Bomba'),
        ('gate', 'Portón'),
        ('camera', 'Cámara'),
        ('generator', 'Generador'),
        ('ac', 'Aire Acondicionado'),
        ('plumbing', 'Plomería'),
        ('electrical', 'Eléctrico'),
        ('other', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('maintenance', 'En Mantenimiento'),
        ('retired', 'Retirado'),
    ]
    
    name = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=30, choices=ASSET_TYPES)
    location = models.CharField(max_length=200)
    model = models.CharField(max_length=100, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    description = models.TextField(blank=True)
    technical_specs = models.JSONField(default=dict, blank=True)
    manual_file = models.FileField(upload_to='manuals/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_asset'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.location}"


class PreventivePlan(models.Model):
    """
    Planes de mantenimiento preventivo
    """
    FREQUENCY_TYPES = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('quarterly', 'Trimestral'),
        ('semi_annual', 'Semestral'),
        ('annual', 'Anual'),
    ]
    
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='preventive_plans')
    name = models.CharField(max_length=200)
    description = models.TextField()
    frequency = models.CharField(max_length=20, choices=FREQUENCY_TYPES)
    frequency_value = models.PositiveIntegerField(default=1)
    estimated_duration = models.PositiveIntegerField(help_text="Duración estimada en minutos")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_preventiveplan'
        ordering = ['asset', 'name']
    
    def __str__(self):
        return f"{self.asset.name} - {self.name}"


class PreventiveTask(models.Model):
    """
    Tareas específicas del mantenimiento preventivo
    """
    plan = models.ForeignKey(PreventivePlan, on_delete=models.CASCADE, related_name='tasks')
    task_name = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(default=1)
    is_required = models.BooleanField(default=True)
    estimated_duration = models.PositiveIntegerField(help_text="Duración estimada en minutos")
    
    class Meta:
        db_table = 'maintenance_preventivetask'
        ordering = ['plan', 'order']
    
    def __str__(self):
        return f"{self.plan.name} - {self.task_name}"


class WorkOrder(models.Model):
    """
    Órdenes de trabajo
    """
    PRIORITY_LEVELS = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
        ('emergency', 'Emergencia'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Abierta'),
        ('assigned', 'Asignada'),
        ('in_progress', 'En Progreso'),
        ('pending_parts', 'Pendiente Repuestos'),
        ('pending_approval', 'Pendiente Aprobación'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('closed', 'Cerrada'),
    ]
    
    WORK_TYPES = [
        ('preventive', 'Preventivo'),
        ('corrective', 'Correctivo'),
        ('emergency', 'Emergencia'),
        ('inspection', 'Inspección'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    work_type = models.CharField(max_length=20, choices=WORK_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='work_orders', null=True, blank=True)
    unit = models.ForeignKey('units.Unit', on_delete=models.CASCADE, related_name='work_orders', null=True, blank=True)
    location = models.CharField(max_length=200)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_work_orders')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_work_orders', null=True, blank=True)
    preventive_plan = models.ForeignKey(PreventivePlan, on_delete=models.CASCADE, null=True, blank=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_workorder'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OT #{self.id} - {self.title}"


class WorkOrderTask(models.Model):
    """
    Tareas específicas de una orden de trabajo
    """
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='work_tasks')
    task_name = models.CharField(max_length=200)
    description = models.TextField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'maintenance_workordertask'
        ordering = ['work_order', 'id']
    
    def __str__(self):
        return f"{self.work_order} - {self.task_name}"


class Supplier(models.Model):
    """
    Proveedores de servicios
    """
    CATEGORIES = [
        ('electrical', 'Eléctrico'),
        ('plumbing', 'Plomería'),
        ('cleaning', 'Limpieza'),
        ('security', 'Seguridad'),
        ('maintenance', 'Mantenimiento'),
        ('construction', 'Construcción'),
        ('landscaping', 'Jardinería'),
        ('other', 'Otro'),
    ]
    
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    specialties = models.TextField(blank=True)
    services = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_supplier'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class WorkOrderCost(models.Model):
    """
    Costos de las órdenes de trabajo
    """
    COST_TYPES = [
        ('labor', 'Mano de Obra'),
        ('materials', 'Materiales'),
        ('parts', 'Repuestos'),
        ('transport', 'Transporte'),
        ('other', 'Otro'),
    ]
    
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='costs')
    cost_type = models.CharField(max_length=20, choices=COST_TYPES)
    description = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, null=True, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'maintenance_workordercost'
        ordering = ['work_order', 'cost_type']
    
    def __str__(self):
        return f"{self.work_order} - {self.description} - {self.total_amount}"
    
    def save(self, *args, **kwargs):
        self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class WorkOrderAttachment(models.Model):
    """
    Adjuntos de órdenes de trabajo (fotos, documentos)
    """
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='work_orders/')
    description = models.CharField(max_length=200, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'maintenance_workorderattachment'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.work_order} - {self.file.name}"