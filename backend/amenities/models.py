from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()


class Amenity(models.Model):
    """
    Áreas comunes del condominio
    """
    AMENITY_TYPES = [
        ('pool', 'Piscina'),
        ('gym', 'Gimnasio'),
        ('party_room', 'Salón de Fiestas'),
        ('bbq', 'Parrillero'),
        ('playground', 'Parque Infantil'),
        ('tennis', 'Cancha de Tenis'),
        ('basketball', 'Cancha de Basketball'),
        ('meeting_room', 'Sala de Juntas'),
        ('library', 'Biblioteca'),
        ('other', 'Otro'),
    ]
    
    name = models.CharField(max_length=200)
    amenity_type = models.CharField(max_length=30, choices=AMENITY_TYPES)
    description = models.TextField(blank=True)
    capacity = models.PositiveIntegerField()
    location = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=False)
    advance_booking_days = models.PositiveIntegerField(default=7)
    max_booking_hours = models.PositiveIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'amenities_amenity'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class AmenitySchedule(models.Model):
    """
    Horarios de las áreas comunes
    """
    DAYS_OF_WEEK = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'amenities_amenityschedule'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['amenity', 'day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.amenity.name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class AmenityRate(models.Model):
    """
    Tarifas de las áreas comunes
    """
    RATE_TYPES = [
        ('hourly', 'Por Hora'),
        ('daily', 'Por Día'),
        ('fixed', 'Tarifa Fija'),
    ]
    
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='rates')
    rate_type = models.CharField(max_length=20, choices=RATE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    effective_date = models.DateField(default=timezone.now)
    
    class Meta:
        db_table = 'amenities_amenityrate'
        ordering = ['amenity', 'effective_date']
    
    def __str__(self):
        return f"{self.amenity.name} - {self.amount} ({self.get_rate_type_display()})"


class AmenityReservation(models.Model):
    """
    Reservas de áreas comunes
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('cancelled', 'Cancelada'),
        ('completed', 'Completada'),
        ('no_show', 'No Show'),
    ]
    
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='reservations')
    unit = models.ForeignKey('units.Unit', on_delete=models.CASCADE, related_name='amenity_reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='amenity_reservations')
    reservation_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    guests_count = models.PositiveIntegerField(default=1)
    special_requirements = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'amenities_amenityreservation'
        ordering = ['-reservation_date', 'start_time']
    
    def __str__(self):
        return f"{self.amenity.name} - {self.unit.code} - {self.reservation_date}"
    
    @property
    def duration_hours(self):
        from datetime import datetime
        start = datetime.combine(self.reservation_date, self.start_time)
        end = datetime.combine(self.reservation_date, self.end_time)
        return (end - start).total_seconds() / 3600


class AmenityBlackout(models.Model):
    """
    Fechas bloqueadas para mantenimiento o eventos especiales
    """
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='blackouts')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'amenities_amenityblackout'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.amenity.name} - {self.start_date} a {self.end_date}"


class AmenityUsage(models.Model):
    """
    Registro de uso de áreas comunes
    """
    reservation = models.OneToOneField(AmenityReservation, on_delete=models.CASCADE, related_name='usage')
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    actual_guests_count = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    checked_in_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='checked_in_usage')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'amenities_amenityusage'
    
    def __str__(self):
        return f"Uso - {self.reservation.amenity.name} - {self.reservation.reservation_date}"