"""
Serializers for finance app.
"""
from rest_framework import serializers
from .models import (
    FeeConcept, BillingPeriod, UnitCharge, Payment, InterestRate,
    CreditNote, Fine
)


class FeeConceptSerializer(serializers.ModelSerializer):
    """Serializer for FeeConcept model."""
    
    class Meta:
        model = FeeConcept
        fields = [
            'id', 'name', 'description', 'concept_type', 'calculation_type',
            'base_amount', 'coefficient_multiplier', 'is_active', 'requires_approval',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BillingPeriodSerializer(serializers.ModelSerializer):
    """Serializer for BillingPeriod model."""
    
    class Meta:
        model = BillingPeriod
        fields = [
            'id', 'name', 'start_date', 'end_date', 'due_date', 'is_closed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UnitChargeSerializer(serializers.ModelSerializer):
    """Serializer for UnitCharge model."""
    
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    unit_address = serializers.CharField(source='unit.full_address', read_only=True)
    fee_concept_name = serializers.CharField(source='fee_concept.name', read_only=True)
    billing_period_name = serializers.CharField(source='billing_period.name', read_only=True)
    remaining_amount = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = UnitCharge
        fields = [
            'id', 'unit', 'unit_code', 'unit_address', 'fee_concept', 'fee_concept_name',
            'billing_period', 'billing_period_name', 'amount', 'status', 'due_date',
            'paid_amount', 'interest_amount', 'discount_amount', 'remaining_amount',
            'is_overdue', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'remaining_amount', 'is_overdue']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    unit_code = serializers.CharField(source='charge.unit.code', read_only=True)
    fee_concept_name = serializers.CharField(source='charge.fee_concept.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'charge', 'unit_code', 'fee_concept_name', 'amount', 'payment_method',
            'payment_date', 'reference', 'notes', 'attachment', 'created_by',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_at', 'created_by']
    
    def create(self, validated_data):
        # Convertir payment_date si viene como string
        if isinstance(validated_data.get('payment_date'), str):
            from datetime import datetime
            validated_data['payment_date'] = datetime.strptime(validated_data['payment_date'], '%Y-%m-%d')
        return super().create(validated_data)


class InterestRateSerializer(serializers.ModelSerializer):
    """Serializer for InterestRate model."""
    
    class Meta:
        model = InterestRate
        fields = [
            'id', 'name', 'rate', 'calculation_base', 'max_interest', 'is_active',
            'effective_date', 'created_at'
        ]
        read_only_fields = ['created_at']


class CreditNoteSerializer(serializers.ModelSerializer):
    """Serializer for CreditNote model."""
    
    unit_code = serializers.CharField(source='charge.unit.code', read_only=True)
    fee_concept_name = serializers.CharField(source='charge.fee_concept.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = CreditNote
        fields = [
            'id', 'charge', 'unit_code', 'fee_concept_name', 'amount', 'reason',
            'approved_by', 'approved_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']


class FineSerializer(serializers.ModelSerializer):
    """Serializer for Fine model."""
    
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    unit_address = serializers.CharField(source='unit.full_address', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Fine
        fields = [
            'id', 'unit', 'unit_code', 'unit_address', 'fine_type', 'amount',
            'description', 'fine_date', 'due_date', 'status', 'paid_amount',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']