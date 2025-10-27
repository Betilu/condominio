"""
Admin configuration for finance app.
"""
from django.contrib import admin
from .models import (
    FeeConcept, BillingPeriod, UnitCharge, Payment, InterestRate,
    CreditNote, Fine
)


@admin.register(FeeConcept)
class FeeConceptAdmin(admin.ModelAdmin):
    list_display = ['name', 'concept_type', 'calculation_type', 'base_amount', 'is_active', 'requires_approval']
    list_filter = ['concept_type', 'calculation_type', 'is_active', 'requires_approval']
    search_fields = ['name', 'description']
    date_hierarchy = 'created_at'


@admin.register(BillingPeriod)
class BillingPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'due_date', 'is_closed']
    list_filter = ['is_closed', 'start_date', 'end_date']
    search_fields = ['name']
    date_hierarchy = 'start_date'


@admin.register(UnitCharge)
class UnitChargeAdmin(admin.ModelAdmin):
    list_display = ['unit', 'fee_concept', 'billing_period', 'amount', 'status', 'due_date', 'paid_amount', 'remaining_amount']
    list_filter = ['status', 'fee_concept__concept_type', 'billing_period', 'due_date']
    search_fields = ['unit__code', 'fee_concept__name', 'billing_period__name']
    date_hierarchy = 'created_at'
    raw_id_fields = ['unit']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['charge', 'amount', 'payment_method', 'payment_date', 'reference', 'created_by']
    list_filter = ['payment_method', 'payment_date', 'created_by']
    search_fields = ['charge__unit__code', 'reference', 'created_by__first_name']
    date_hierarchy = 'payment_date'
    raw_id_fields = ['charge', 'created_by']


@admin.register(InterestRate)
class InterestRateAdmin(admin.ModelAdmin):
    list_display = ['name', 'rate', 'calculation_base', 'max_interest', 'is_active', 'effective_date']
    list_filter = ['is_active', 'calculation_base', 'effective_date']
    search_fields = ['name']
    date_hierarchy = 'effective_date'


@admin.register(CreditNote)
class CreditNoteAdmin(admin.ModelAdmin):
    list_display = ['charge', 'amount', 'reason', 'approved_by', 'created_at']
    list_filter = ['created_at', 'approved_by']
    search_fields = ['charge__unit__code', 'reason', 'approved_by__first_name']
    date_hierarchy = 'created_at'
    raw_id_fields = ['charge', 'approved_by']


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ['unit', 'fine_type', 'amount', 'fine_date', 'due_date', 'status', 'paid_amount', 'created_by']
    list_filter = ['fine_type', 'status', 'fine_date', 'due_date']
    search_fields = ['unit__code', 'description', 'created_by__first_name']
    date_hierarchy = 'fine_date'
    raw_id_fields = ['unit', 'created_by']