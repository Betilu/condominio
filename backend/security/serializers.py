"""
Serializers for security app.
"""
from rest_framework import serializers
from .models import (
    Visitor, AccessAuthorization, AccessEvent, 
    SecurityGuard, SecurityIncident, VisitorFaceEncoding, VisitorAttendance
)


class VisitorSerializer(serializers.ModelSerializer):
    """Serializer for Visitor model."""
    
    photo_url = serializers.SerializerMethodField()
    
    def get_photo_url(self, obj):
        """Get the full URL for the photo."""
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return f'/media/{obj.photo}'
        return None
    
    def validate(self, data):
        """Validate all data."""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'=== VALIDANDO DATOS COMPLETOS ===')
        logger.info(f'Datos recibidos: {data}')
        
        return super().validate(data)
    
    def validate_photo(self, value):
        """Validate photo field."""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'=== VALIDANDO FOTO ===')
        logger.info(f'Valor recibido: {value}')
        logger.info(f'Tipo: {type(value)}')
        
        if value is None or value == '':
            logger.info('Foto es None o vacía, permitiendo')
            return None
        
        # Verificar que es un archivo
        if not hasattr(value, 'name'):
            logger.error(f'No es un archivo válido: {value}')
            raise serializers.ValidationError("Archivo inválido")
        
        logger.info(f'Archivo válido: {value.name}, tamaño: {getattr(value, "size", "unknown")}')
        
        # Verificar que el archivo no esté vacío
        if hasattr(value, 'size') and value.size == 0:
            raise serializers.ValidationError("El archivo está vacío")
        
        # Verificar tipo de archivo por extensión
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        file_extension = '.' + value.name.split('.')[-1].lower() if '.' in value.name else ''
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError("Solo se permiten archivos de imagen (JPG, PNG, GIF)")
        
        # Verificar tamaño (máximo 5MB)
        if hasattr(value, 'size') and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("El archivo es demasiado grande. Máximo 5MB")
        
        logger.info('✅ Foto validada correctamente')
        return value
    
    class Meta:
        model = Visitor
        fields = [
            'id', 'first_name', 'last_name', 'document_type', 'document_number',
            'phone', 'email', 'photo', 'photo_url', 'is_blacklisted', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'photo_url']


class AccessAuthorizationSerializer(serializers.ModelSerializer):
    """Serializer for AccessAuthorization model."""
    
    visitor_name = serializers.CharField(source='visitor.first_name', read_only=True)
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    authorized_by_name = serializers.CharField(source='authorized_by.get_full_name', read_only=True)
    
    class Meta:
        model = AccessAuthorization
        fields = [
            'id', 'visitor', 'visitor_name', 'unit', 'unit_code', 'authorized_by',
            'authorized_by_name', 'purpose', 'start_date', 'end_date', 'status',
            'max_visitors', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at', 'authorized_by']


class AccessEventSerializer(serializers.ModelSerializer):
    """Serializer for AccessEvent model."""
    
    visitor_name = serializers.CharField(source='visitor.first_name', read_only=True)
    visitor_last_name = serializers.CharField(source='visitor.last_name', read_only=True)
    visitor_document = serializers.CharField(source='visitor.document_number', read_only=True)
    authorization_visitor_name = serializers.CharField(source='authorization.visitor.first_name', read_only=True)
    authorization_unit_code = serializers.CharField(source='authorization.unit.code', read_only=True)
    authorization_purpose = serializers.CharField(source='authorization.purpose', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    
    class Meta:
        model = AccessEvent
        fields = [
            'id', 'visitor', 'visitor_name', 'visitor_last_name', 'visitor_document',
            'authorization', 'authorization_visitor_name', 'authorization_unit_code', 'authorization_purpose',
            'event_type', 'detection_type', 'timestamp', 'camera_location', 'confidence_score',
            'notes', 'processed_by', 'processed_by_name'
        ]
        read_only_fields = ['processed_by']


class SecurityGuardSerializer(serializers.ModelSerializer):
    """Serializer for SecurityGuard model."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = SecurityGuard
        fields = [
            'id', 'user', 'user_name', 'user_email', 'employee_id',
            'shift_start', 'shift_end', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']


class SecurityIncidentSerializer(serializers.ModelSerializer):
    """Serializer for SecurityIncident model."""
    
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = SecurityIncident
        fields = [
            'id', 'incident_type', 'severity', 'description', 'location',
            'incident_date', 'reported_by', 'reported_by_name', 'assigned_to',
            'assigned_to_name', 'status', 'resolution_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'reported_by']


class VisitorFaceEncodingSerializer(serializers.ModelSerializer):
    """Serializer for VisitorFaceEncoding model."""
    
    visitor_name = serializers.CharField(source='visitor.get_full_name', read_only=True)
    
    class Meta:
        model = VisitorFaceEncoding
        fields = [
            'id', 'visitor', 'visitor_name', 'face_encoding', 'confidence_threshold',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VisitorAttendanceSerializer(serializers.ModelSerializer):
    """Serializer for VisitorAttendance model."""
    
    visitor_name = serializers.CharField(source='visitor.get_full_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    
    class Meta:
        model = VisitorAttendance
        fields = [
            'id', 'visitor', 'visitor_name', 'attendance_type', 'timestamp',
            'confidence_score', 'camera_location', 'notes', 'processed_by',
            'processed_by_name'
        ]
        read_only_fields = ['timestamp', 'processed_by']