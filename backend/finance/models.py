from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class FeeConcept(models.Model):
    """
    Conceptos de cobro (expensas, multas, etc.)
    """
    CONCEPT_TYPES = [
        ('ordinary', 'Gasto Ordinario'),
        ('extraordinary', 'Gasto Extraordinario'),
        ('fine', 'Multa'),
        ('interest', 'Interés Moratorio'),
        ('other', 'Otro'),
    ]
    
    CALCULATION_TYPES = [
        ('coefficient', 'Por Coeficiente'),
        ('fixed', 'Monto Fijo'),
        ('mixed', 'Mixto'),
    ]
    
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    concept_type = models.CharField(max_length=20, choices=CONCEPT_TYPES)
    calculation_type = models.CharField(max_length=20, choices=CALCULATION_TYPES)
    base_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coefficient_multiplier = models.DecimalField(max_digits=8, decimal_places=4, default=1.0)
    is_active = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_feeconcept'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class BillingPeriod(models.Model):
    """
    Períodos de facturación
    """
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    due_date = models.DateField()
    is_active = models.BooleanField(default=True)
    is_closed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_billingperiod'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"


class UnitCharge(models.Model):
    """
    Cargos por unidad
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('partial', 'Parcialmente Pagado'),
        ('paid', 'Pagado'),
        ('overdue', 'Vencido'),
        ('cancelled', 'Cancelado'),
    ]
    
    unit = models.ForeignKey('units.Unit', on_delete=models.CASCADE, related_name='charges')
    fee_concept = models.ForeignKey(FeeConcept, on_delete=models.CASCADE)
    billing_period = models.ForeignKey(BillingPeriod, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    interest_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'finance_unitcharge'
        ordering = ['-created_at']
        unique_together = ['unit', 'fee_concept', 'billing_period']
    
    def __str__(self):
        return f"{self.unit.code} - {self.fee_concept.name} - {self.billing_period.name}"
    
    @property
    def remaining_amount(self):
        return self.amount - self.paid_amount + self.interest_amount - self.discount_amount
    
    @property
    def is_overdue(self):
        return self.due_date < timezone.now().date() and self.status != 'paid'


class Payment(models.Model):
    """
    Pagos realizados
    """
    PAYMENT_METHODS = [
        ('cash', 'Efectivo'),
        ('bank_transfer', 'Transferencia Bancaria'),
        ('check', 'Cheque'),
        ('credit_card', 'Tarjeta de Crédito'),
        ('other', 'Otro'),
    ]
    
    charge = models.ForeignKey(UnitCharge, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_date = models.DateTimeField(default=timezone.now)
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    attachment = models.FileField(upload_to='payments/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_payment'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Pago {self.amount} - {self.charge.unit.code}"


class InterestRate(models.Model):
    """
    Tasas de interés moratorio
    """
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    calculation_base = models.CharField(max_length=20, choices=[('daily', 'Diario'), ('monthly', 'Mensual')])
    max_interest = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    effective_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_interestrate'
        ordering = ['-effective_date']
    
    def __str__(self):
        return f"{self.name} - {self.rate}%"


class CreditNote(models.Model):
    """
    Notas de crédito
    """
    charge = models.ForeignKey(UnitCharge, on_delete=models.CASCADE, related_name='credit_notes')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approved_credits')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_creditnote'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Nota Crédito {self.amount} - {self.charge.unit.code}"


class Fine(models.Model):
    """
    Multas por normativa
    """
    FINE_TYPES = [
        ('noise', 'Ruido'),
        ('parking', 'Estacionamiento'),
        ('common_area', 'Área Común'),
        ('pets', 'Mascotas'),
        ('other', 'Otro'),
    ]
    
    unit = models.ForeignKey('units.Unit', on_delete=models.CASCADE, related_name='fines')
    fine_type = models.CharField(max_length=20, choices=FINE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    fine_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=UnitCharge.STATUS_CHOICES, default='pending')
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'finance_fine'
        ordering = ['-fine_date']
    
    def __str__(self):
        return f"Multa {self.amount} - {self.unit.code} - {self.get_fine_type_display()}"