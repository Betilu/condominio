from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Visitor(models.Model):
    """
    Visitantes del condominio
    """
    DOCUMENT_TYPES = [
        ('id', 'Cédula'),
        ('passport', 'Pasaporte'),
        ('license', 'Licencia'),
        ('other', 'Otro'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    photo = models.FileField(upload_to='visitors/', blank=True, null=True)
    is_blacklisted = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'security_visitor'
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_full_name(self):
        """Retorna el nombre completo del visitante"""
        return f"{self.first_name} {self.last_name}"


class AccessAuthorization(models.Model):
    """
    Autorizaciones de acceso
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobada'),
        ('rejected', 'Rechazada'),
        ('expired', 'Expirada'),
    ]
    
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='authorizations')
    unit = models.ForeignKey('units.Unit', on_delete=models.CASCADE)
    authorized_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authorized_visits')
    purpose = models.CharField(max_length=200)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    max_visitors = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'security_accessauthorization'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.visitor} - {self.unit.code} - {self.start_date.date()}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.end_date


class AccessEvent(models.Model):
    """
    Eventos de acceso (entrada/salida)
    """
    EVENT_TYPES = [
        ('entry', 'Entrada'),
        ('exit', 'Salida'),
        ('denied', 'Acceso Denegado'),
    ]
    
    DETECTION_TYPES = [
        ('manual', 'Manual'),
        ('facial', 'Reconocimiento Facial'),
        ('plate', 'Reconocimiento de Placa'),
        ('qr', 'Código QR'),
        ('card', 'Tarjeta'),
    ]
    
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='access_events')
    authorization = models.ForeignKey(AccessAuthorization, on_delete=models.CASCADE, null=True, blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    detection_type = models.CharField(max_length=20, choices=DETECTION_TYPES, default='manual')
    timestamp = models.DateTimeField(default=timezone.now)
    camera_location = models.CharField(max_length=100, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        db_table = 'security_accessevent'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.visitor} - {self.get_event_type_display()} - {self.timestamp}"


class SecurityGuard(models.Model):
    """
    Guardias de seguridad
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_guard')
    employee_id = models.CharField(max_length=20, unique=True)
    shift_start = models.TimeField()
    shift_end = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'security_securityguard'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.employee_id}"


class SecurityIncident(models.Model):
    """
    Incidentes de seguridad
    """
    INCIDENT_TYPES = [
        ('unauthorized_access', 'Acceso No Autorizado'),
        ('suspicious_activity', 'Actividad Sospechosa'),
        ('vandalism', 'Vandalismo'),
        ('theft', 'Robo'),
        ('other', 'Otro'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Bajo'),
        ('medium', 'Medio'),
        ('high', 'Alto'),
        ('critical', 'Crítico'),
    ]
    
    incident_type = models.CharField(max_length=30, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    description = models.TextField()
    location = models.CharField(max_length=200)
    incident_date = models.DateTimeField(default=timezone.now)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_incidents')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_incidents', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('open', 'Abierto'),
        ('investigating', 'En Investigación'),
        ('resolved', 'Resuelto'),
        ('closed', 'Cerrado'),
    ], default='open')
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'security_securityincident'
        ordering = ['-incident_date']
    
    def __str__(self):
        return f"{self.get_incident_type_display()} - {self.incident_date.date()}"


class VisitorFaceEncoding(models.Model):
    """
    Codificaciones faciales de visitantes para reconocimiento
    """
    visitor = models.OneToOneField(Visitor, on_delete=models.CASCADE, related_name='face_encoding')
    face_encoding = models.TextField(help_text="Codificación facial en formato JSON")
    confidence_threshold = models.FloatField(default=0.6, help_text="Umbral de confianza para reconocimiento")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'security_visitor_face_encoding'
    
    def __str__(self):
        return f"Face encoding for {self.visitor}"


class VisitorAttendance(models.Model):
    """
    Registro de asistencia de visitantes con reconocimiento facial
    """
    ATTENDANCE_TYPES = [
        ('entry', 'Entrada'),
        ('exit', 'Salida'),
    ]
    
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='attendances')
    attendance_type = models.CharField(max_length=10, choices=ATTENDANCE_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    confidence_score = models.FloatField(help_text="Puntuación de confianza del reconocimiento")
    camera_location = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_attendances')
    
    class Meta:
        db_table = 'security_visitor_attendance'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.visitor} - {self.get_attendance_type_display()} at {self.timestamp}"