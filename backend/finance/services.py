"""
Business logic services for finance app.
"""
from datetime import date, timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from .models import FeeConfig, Charge, Payment
from units.models import Unit


class FinanceService:
    """Service class for finance operations."""
    
    @staticmethod
    @transaction.atomic
    def emit_monthly_charges(period: str) -> dict:
        """
        Emit charges for all active units for the given period.
        
        Args:
            period: Period in format YYYY-MM
            
        Returns:
            dict: Summary of emission results
        """
        # Get active fee configurations
        active_configs = FeeConfig.objects.filter(active=True, periodicity='mensual')
        
        # Get all units with status different from 'vacio'
        active_units = Unit.objects.exclude(status='vacio')
        
        issued_count = 0
        skipped_count = 0
        
        # Calculate due date (end of month + 10 days)
        year, month = map(int, period.split('-'))
        if month == 12:
            next_month = date(year + 1, 1, 1)
        else:
            next_month = date(year, month + 1, 1)
        due_date = next_month + timedelta(days=9)  # 10th of next month
        
        for unit in active_units:
            for config in active_configs:
                # Check if charge already exists
                existing_charge = Charge.objects.filter(
                    unit=unit,
                    fee_config=config,
                    period=period
                ).first()
                
                if existing_charge:
                    skipped_count += 1
                    continue
                
                # Create new charge
                Charge.objects.create(
                    unit=unit,
                    fee_config=config,
                    period=period,
                    amount=config.base_amount,
                    due_date=due_date
                )
                issued_count += 1
        
        return {
            'issued': issued_count,
            'skipped': skipped_count,
            'period': period
        }
    
    @staticmethod
    def compute_late_fee(charge: Charge, as_of_date: date = None) -> Decimal:
        """
        Compute late fee for a charge.
        
        Args:
            charge: Charge instance
            as_of_date: Date to calculate from (defaults to today)
            
        Returns:
            Decimal: Late fee amount
        """
        if as_of_date is None:
            as_of_date = timezone.now().date()
        
        if as_of_date <= charge.due_date:
            return Decimal('0.00')
        
        days_late = (as_of_date - charge.due_date).days
        if days_late <= 0:
            return Decimal('0.00')
        
        # Calculate proportional annual interest
        annual_rate = charge.fee_config.late_interest_rate / 100
        daily_rate = annual_rate / 365
        
        late_fee = charge.amount * Decimal(str(daily_rate)) * days_late
        return late_fee.quantize(Decimal('0.01'))
    
    @staticmethod
    @transaction.atomic
    def process_payment(charge_id: int, amount: Decimal, method: str, 
                       reference: str = '', created_by=None) -> Payment:
        """
        Process a payment for a charge.
        
        Args:
            charge_id: ID of the charge
            amount: Payment amount
            method: Payment method
            reference: Payment reference
            created_by: User who created the payment
            
        Returns:
            Payment: Created payment instance
        """
        charge = Charge.objects.get(id=charge_id)
        
        # Validate payment amount
        if amount > charge.balance:
            raise ValueError(f"Payment amount cannot exceed balance: {charge.balance}")
        
        # Create payment
        payment = Payment.objects.create(
            charge=charge,
            paid_amount=amount,
            method=method,
            reference=reference,
            created_by=created_by
        )
        
        # Update charge status
        if charge.balance == Decimal('0.00'):
            charge.status = 'paid'
        elif charge.paid_amount > Decimal('0.00'):
            charge.status = 'partial'
        
        charge.save()
        
        return payment