"""
Models for notices management.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

from units.models import UnitTower, UnitBlock, Unit

User = get_user_model()


def notice_image_upload_path(instance, filename):
    """Generate upload path for notice images."""
    ext = filename.split('.')[-1]
    return f'notices/{uuid.uuid4()}.{ext}'


class Notice(models.Model):
    """Model for condominium notices."""
    
    AUDIENCE_CHOICES = [
        ('global', 'Global'),
        ('torre', 'Torre'),
        ('bloque', 'Bloque'),
        ('unidad', 'Unidad'),
        ('propietarios', 'Propietarios'),
        ('inquilinos', 'Inquilinos'),
    ]
    
    PRIORITY_CHOICES = [
        ('baja', 'Baja'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]
    
    title = models.CharField(max_length=200)
    body = models.TextField()
    image = models.ImageField(upload_to=notice_image_upload_path, blank=True, null=True)
    audience_scope = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='global')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Target fields (depending on audience_scope)
    target_tower = models.ForeignKey(
        UnitTower, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Torre objetivo (si scope es torre, bloque o unidad)"
    )
    target_block = models.ForeignKey(
        UnitBlock,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Bloque objetivo (si scope es bloque o unidad)"
    )
    target_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Unidad objetivo (si scope es unidad)"
    )
    
    # Scheduling
    publish_at = models.DateTimeField(help_text="Fecha y hora de publicación")
    expire_at = models.DateTimeField(null=True, blank=True, help_text="Fecha y hora de expiración")
    
    # Attachments
    attachment = models.FileField(
        upload_to='notices/attachments/', 
        blank=True, 
        null=True,
        help_text="Archivo adjunto (PDF, imagen, etc.)"
    )
    
    # Tracking
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notices_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Read confirmation
    requires_confirmation = models.BooleanField(
        default=False, 
        help_text="Requiere confirmación de lectura"
    )
    
    class Meta:
        db_table = 'notices_notice'
        ordering = ['-publish_at', '-priority']
        indexes = [
            models.Index(fields=['audience_scope']),
            models.Index(fields=['publish_at']),
            models.Index(fields=['expire_at']),
            models.Index(fields=['priority']),
            models.Index(fields=['requires_confirmation']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_audience_scope_display()})"
    
    @property
    def is_active(self):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.publish_at <= now and
            (self.expire_at is None or self.expire_at > now)
        )
    
    @property
    def read_rate(self):
        """Calculate read rate percentage."""
        total_recipients = self.get_recipients_count()
        if total_recipients == 0:
            return 0
        
        read_count = self.read_confirmations.count()
        return round((read_count / total_recipients) * 100, 2)
    
    def get_recipients_count(self):
        """Get total number of recipients for this notice."""
        from django.db.models import Q
        
        if self.audience_scope == 'global':
            return User.objects.filter(is_resident=True).count()
        elif self.audience_scope == 'propietarios':
            return Unit.objects.filter(owner__isnull=False).values('owner').distinct().count()
        elif self.audience_scope == 'inquilinos':
            return Unit.objects.filter(tenant__isnull=False).values('tenant').distinct().count()
        elif self.audience_scope == 'torre' and self.target_tower:
            return Unit.objects.filter(block__tower=self.target_tower).count()
        elif self.audience_scope == 'bloque' and self.target_block:
            return Unit.objects.filter(block=self.target_block).count()
        elif self.audience_scope == 'unidad' and self.target_unit:
            return 1
        
        return 0


class NoticeReadConfirmation(models.Model):
    """Model for tracking notice read confirmations."""
    
    notice = models.ForeignKey(
        Notice, 
        on_delete=models.CASCADE, 
        related_name='read_confirmations'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notice_confirmations')
    read_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        db_table = 'notices_noticereadconfirmation'
        unique_together = ['notice', 'user']
        ordering = ['-read_at']
        indexes = [
            models.Index(fields=['notice', 'user']),
            models.Index(fields=['read_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.notice.title} ({self.read_at})"