"""
Serializers for accounts app.
"""
from rest_framework import serializers
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from .models import UserRole, PasswordResetToken

User = get_user_model()


class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer for UserRole model."""
    
    class Meta:
        model = UserRole
        fields = [
            'id', 'name', 'description', 'permissions', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    groups = serializers.StringRelatedField(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    custom_role_name = serializers.CharField(source='custom_role.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'document_number', 'is_resident', 'is_active',
            'email_notifications', 'whatsapp_notifications', 'whatsapp_number',
            'two_factor_enabled', 'last_password_change', 'failed_login_attempts',
            'locked_until', 'custom_role', 'custom_role_name', 'groups', 
            'password', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'last_password_change', 
            'failed_login_attempts', 'locked_until'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
            from django.utils import timezone
            instance.last_password_change = timezone.now()
        instance.save()
        return instance


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    """Serializer for PasswordResetToken model."""
    
    class Meta:
        model = PasswordResetToken
        fields = [
            'id', 'user', 'token', 'created_at', 'expires_at', 'used'
        ]
        read_only_fields = ['token', 'created_at']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group model."""
    
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserGroupAssignmentSerializer(serializers.Serializer):
    """Serializer for assigning groups to users."""
    
    user_id = serializers.IntegerField()
    group_id = serializers.IntegerField()
    
    def validate_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Usuario no encontrado.")
        return value
    
    def validate_group_id(self, value):
        if not Group.objects.filter(id=value).exists():
            raise serializers.ValidationError("Grupo no encontrado.")
        return value