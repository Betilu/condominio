"""
Serializers for notices app.
"""
from rest_framework import serializers
from .models import Notice, NoticeReadConfirmation


class NoticeSerializer(serializers.ModelSerializer):
    """Serializer for Notice model."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    target_tower_name = serializers.CharField(source='target_tower.name', read_only=True)
    target_block_name = serializers.CharField(source='target_block.name', read_only=True)
    target_unit_code = serializers.CharField(source='target_unit.code', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    read_rate = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    recipients_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = [
            'id', 'title', 'body', 'image', 'attachment', 'audience_scope', 'priority',
            'target_tower', 'target_tower_name',
            'target_block', 'target_block_name',
            'target_unit', 'target_unit_code',
            'publish_at', 'expire_at', 'requires_confirmation',
            'created_by', 'created_by_name', 'is_active', 'read_rate',
            'recipients_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_active', 'read_rate', 'recipients_count', 'created_by']
    
    def get_recipients_count(self, obj):
        return obj.get_recipients_count()
    
    def validate(self, data):
        audience_scope = data.get('audience_scope')
        
        # Validate target fields based on audience scope
        if audience_scope == 'torre':
            if not data.get('target_tower'):
                raise serializers.ValidationError(
                    "target_tower es requerido cuando audience_scope es 'torre'"
                )
        elif audience_scope == 'bloque':
            if not data.get('target_block'):
                raise serializers.ValidationError(
                    "target_block es requerido cuando audience_scope es 'bloque'"
                )
        elif audience_scope == 'unidad':
            if not data.get('target_unit'):
                raise serializers.ValidationError(
                    "target_unit es requerido cuando audience_scope es 'unidad'"
                )
        
        return data


class NoticeReadConfirmationSerializer(serializers.ModelSerializer):
    """Serializer for NoticeReadConfirmation model."""
    
    notice_title = serializers.CharField(source='notice.title', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NoticeReadConfirmation
        fields = [
            'id', 'notice', 'notice_title', 'user', 'user_name',
            'read_at', 'ip_address', 'user_agent'
        ]
        read_only_fields = ['read_at']