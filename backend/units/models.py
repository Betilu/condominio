"""
Models for managing towers, blocks, units and memberships.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class UnitTower(models.Model):
    """Model for condominium towers."""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'units_tower'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UnitBlock(models.Model):
    """Model for blocks within towers."""
    
    tower = models.ForeignKey(UnitTower, on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'units_block'
        unique_together = ['tower', 'name']
        ordering = ['tower', 'name']
    
    def __str__(self):
        return f"{self.tower.name} - {self.name}"


class Unit(models.Model):
    """Model for individual units (apartments, parking spaces, etc.)."""
    
    CATEGORY_CHOICES = [
        ('departamento', 'Departamento'),
        ('cochera', 'Cochera'),
        ('bodega', 'Bodega'),
        ('estacionamiento', 'Estacionamiento'),
    ]
    
    STATUS_CHOICES = [
        ('ocupada', 'Ocupada'),
        ('vacía', 'Vacía'),
        ('mantenimiento', 'En Mantenimiento'),
    ]
    
    block = models.ForeignKey(UnitBlock, on_delete=models.CASCADE, related_name='units')
    code = models.CharField(max_length=20, unique=True, help_text="Código único de la unidad")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='departamento')
    floor = models.IntegerField(null=True, blank=True)
    number = models.CharField(max_length=10, blank=True)
    
    # Physical characteristics
    area = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Área en m²")
    ownership_coefficient = models.DecimalField(
        max_digits=8, 
        decimal_places=6, 
        null=True, 
        blank=True, 
        help_text="Coeficiente de copropiedad"
    )
    bedrooms = models.IntegerField(default=0, help_text="Número de habitaciones")
    bathrooms = models.IntegerField(default=0, help_text="Número de baños")
    parking_spaces = models.IntegerField(default=0, help_text="Espacios de estacionamiento")
    storage_rooms = models.IntegerField(default=0, help_text="Número de bodegas")
    
    # Current status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='vacía')
    
    # Current occupants
    owner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='owned_units',
        help_text="Propietario actual de la unidad"
    )
    tenant = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='rented_units',
        help_text="Inquilino actual de la unidad"
    )
    
    # Contact preferences for this unit
    owner_email = models.EmailField(blank=True, help_text="Email del propietario")
    owner_phone = models.CharField(max_length=20, blank=True, help_text="Teléfono del propietario")
    owner_whatsapp = models.CharField(max_length=20, blank=True, help_text="WhatsApp del propietario")
    
    tenant_email = models.EmailField(blank=True, help_text="Email del inquilino")
    tenant_phone = models.CharField(max_length=20, blank=True, help_text="Teléfono del inquilino")
    tenant_whatsapp = models.CharField(max_length=20, blank=True, help_text="WhatsApp del inquilino")
    
    # Preferences
    owner_notifications = models.BooleanField(default=True, help_text="Propietario recibe notificaciones")
    tenant_notifications = models.BooleanField(default=True, help_text="Inquilino recibe notificaciones")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'units_unit'
        ordering = ['block__tower', 'block', 'code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['status']),
            models.Index(fields=['owner']),
            models.Index(fields=['tenant']),
        ]
    
    def __str__(self):
        return f"{self.block.tower.name} - {self.block.name} - {self.code}"
    
    def clean(self):
        """Validate unit data."""
        if self.area and self.area <= 0:
            raise ValidationError("El área debe ser mayor a 0.")
        
        if self.ownership_coefficient and (self.ownership_coefficient <= 0 or self.ownership_coefficient > 1):
            raise ValidationError("El coeficiente de copropiedad debe estar entre 0 y 1.")
        
        if self.owner and self.tenant and self.owner == self.tenant:
            raise ValidationError("El propietario y el inquilino no pueden ser la misma persona.")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def is_occupied(self):
        """Check if unit has any occupant."""
        return self.owner is not None or self.tenant is not None
    
    @property
    def full_address(self):
        """Get full address of the unit."""
        return f"{self.block.tower.name}, {self.block.name}, {self.code}"
    
    def get_primary_contact_email(self):
        """Get primary contact email (owner first, then tenant)."""
        if self.owner and self.owner.email:
            return self.owner.email
        elif self.tenant and self.tenant.email:
            return self.tenant.email
        elif self.owner_email:
            return self.owner_email
        elif self.tenant_email:
            return self.tenant_email
        return None
    
    def get_primary_contact_phone(self):
        """Get primary contact phone (owner first, then tenant)."""
        if self.owner and self.owner.phone:
            return self.owner.phone
        elif self.tenant and self.tenant.phone:
            return self.tenant.phone
        elif self.owner_phone:
            return self.owner_phone
        elif self.tenant_phone:
            return self.tenant_phone
        return None


class UnitMembership(models.Model):
    """Historical model for unit-user relationships."""
    
    ROLE_CHOICES = [
        ('propietario', 'Propietario'),
        ('inquilino', 'Inquilino'),
    ]
    
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='unit_memberships')
    role_in_unit = models.CharField(max_length=20, choices=ROLE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'units_membership'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['unit', 'start_date']),
            models.Index(fields=['user', 'start_date']),
        ]
    
    def clean(self):
        if self.end_date and self.end_date <= self.start_date:
            raise ValidationError("La fecha de fin debe ser posterior a la fecha de inicio.")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.unit.code} ({self.role_in_unit})"