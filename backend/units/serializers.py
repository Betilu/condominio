"""
Serializers for units app.
"""
from rest_framework import serializers
from .models import UnitTower, UnitBlock, Unit, UnitMembership


class UnitTowerSerializer(serializers.ModelSerializer):
    """Serializer for UnitTower model."""
    
    blocks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitTower
        fields = ['id', 'name', 'description', 'blocks_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_blocks_count(self, obj):
        return obj.blocks.count()


class UnitBlockSerializer(serializers.ModelSerializer):
    """Serializer for UnitBlock model."""
    
    tower_name = serializers.CharField(source='tower.name', read_only=True)
    units_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitBlock
        fields = ['id', 'tower', 'tower_name', 'name', 'description', 'units_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_units_count(self, obj):
        return obj.units.count()


class UnitSerializer(serializers.ModelSerializer):
    """Serializer for Unit model."""
    
    block_name = serializers.CharField(source='block.name', read_only=True)
    tower_name = serializers.CharField(source='block.tower.name', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    tenant_name = serializers.CharField(source='tenant.get_full_name', read_only=True)
    full_address = serializers.CharField(read_only=True)
    is_occupied = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Unit
        fields = [
            'id', 'block', 'block_name', 'tower_name', 'code', 'category',
            'floor', 'number', 'area', 'ownership_coefficient', 'bedrooms',
            'bathrooms', 'parking_spaces', 'storage_rooms', 'status',
            'owner', 'owner_name', 'tenant', 'tenant_name',
            'owner_email', 'owner_phone', 'owner_whatsapp',
            'tenant_email', 'tenant_phone', 'tenant_whatsapp',
            'owner_notifications', 'tenant_notifications',
            'full_address', 'is_occupied', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'full_address', 'is_occupied']
    
    
    def validate(self, data):
        """Validate unit data."""
        # Validate required fields
        if not data.get('code'):
            raise serializers.ValidationError({'code': 'El código es obligatorio.'})
        
        if not data.get('block'):
            raise serializers.ValidationError({'block': 'El bloque es obligatorio.'})
        
        # Check if code is unique
        if 'code' in data:
            existing_unit = Unit.objects.filter(code=data['code']).exclude(pk=self.instance.pk if self.instance else None)
            if existing_unit.exists():
                raise serializers.ValidationError({'code': 'Ya existe una unidad con este código.'})
        
        # Validate block exists
        if 'block' in data and data['block'] is not None:
            try:
                from .models import UnitBlock
                
                # Handle both ID and object cases
                if hasattr(data['block'], 'id'):
                    # It's already an object
                    block = data['block']
                else:
                    # It's an ID, convert to int if string
                    block_id = int(data['block']) if isinstance(data['block'], str) else data['block']
                    block = UnitBlock.objects.get(id=block_id)
            except (UnitBlock.DoesNotExist, ValueError, TypeError):
                raise serializers.ValidationError({'block': 'El bloque seleccionado no existe.'})
        
        # Validate numeric fields
        if 'area' in data and data['area'] is not None and data['area'] <= 0:
            raise serializers.ValidationError({'area': 'El área debe ser mayor a 0.'})
        
        if 'ownership_coefficient' in data and data['ownership_coefficient'] is not None:
            if data['ownership_coefficient'] <= 0 or data['ownership_coefficient'] > 1:
                raise serializers.ValidationError({'ownership_coefficient': 'El coeficiente de copropiedad debe estar entre 0 y 1.'})
        
        # Validate owner and tenant are different
        if data.get('owner') and data.get('tenant') and data['owner'] == data['tenant']:
            raise serializers.ValidationError({'owner': 'El propietario y el inquilino no pueden ser la misma persona.'})
        
        return data


class UnitMembershipSerializer(serializers.ModelSerializer):
    """Serializer for UnitMembership model."""
    
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = UnitMembership
        fields = [
            'id', 'unit', 'unit_code', 'user', 'user_name',
            'role_in_unit', 'start_date', 'end_date', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "La fecha de fin debe ser posterior a la fecha de inicio."
                )
        return data