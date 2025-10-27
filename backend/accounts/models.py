"""
Models for user accounts and authentication.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import Permission
from django.core.exceptions import ValidationError
from django.utils import timezone


class UserRole(models.Model):
    """
    Custom roles for condominium management.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts_userrole'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class User(AbstractUser):
    """
    Extended user model with additional fields for condominium management.
    """
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    document_number = models.CharField(max_length=20, blank=True, help_text="RUT o Cédula")
    
    # Profile fields
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    is_resident = models.BooleanField(default=False, help_text="Es residente del condominio")
    
    # Contact preferences
    email_notifications = models.BooleanField(default=True, help_text="Recibir notificaciones por email")
    whatsapp_notifications = models.BooleanField(default=False, help_text="Recibir notificaciones por WhatsApp")
    whatsapp_number = models.CharField(max_length=20, blank=True, help_text="Número de WhatsApp")
    
    # Security
    two_factor_enabled = models.BooleanField(default=False, help_text="2FA habilitado")
    last_password_change = models.DateTimeField(default=timezone.now)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Custom role
    custom_role = models.ForeignKey(
        UserRole, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Rol personalizado del usuario"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_user'
        
    def __str__(self):
        return f"{self.username} - {self.get_full_name()}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_effective_permissions(self):
        """
        Get all permissions for this user (from groups + custom role + user permissions).
        """
        permissions = set()
        
        # Permissions from groups
        for group in self.groups.all():
            permissions.update(group.permissions.all())
        
        # Permissions from custom role
        if self.custom_role:
            permissions.update(self.custom_role.permissions.all())
        
        # Direct user permissions
        permissions.update(self.user_permissions.all())
        
        return permissions
    
    def has_custom_role(self, role_name):
        """Check if user has a specific custom role."""
        return self.custom_role and self.custom_role.name == role_name
    
    def is_locked(self):
        """Check if user account is locked due to failed login attempts."""
        if self.locked_until:
            from django.utils import timezone
            return timezone.now() < self.locked_until
        return False


class PasswordResetToken(models.Model):
    """
    Model for password reset tokens.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'accounts_passwordresettoken'
        ordering = ['-created_at']
    
    def is_valid(self):
        """Check if token is valid and not expired."""
        from django.utils import timezone
        return not self.used and timezone.now() < self.expires_at