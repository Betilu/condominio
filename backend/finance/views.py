"""
Views for finance app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    FeeConcept, BillingPeriod, UnitCharge, Payment, InterestRate,
    CreditNote, Fine
)
from .serializers import (
    FeeConceptSerializer, BillingPeriodSerializer, UnitChargeSerializer,
    PaymentSerializer, InterestRateSerializer, CreditNoteSerializer, FineSerializer
)
from accounts.permissions import IsAdminUser


class FeeConceptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee concepts."""
    
    queryset = FeeConcept.objects.all()
    serializer_class = FeeConceptSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['concept_type', 'calculation_type', 'is_active', 'requires_approval']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class BillingPeriodViewSet(viewsets.ModelViewSet):
    """ViewSet for managing billing periods."""
    
    queryset = BillingPeriod.objects.all()
    serializer_class = BillingPeriodSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_closed', 'start_date', 'end_date']
    search_fields = ['name']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']


class UnitChargeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing unit charges."""
    
    queryset = UnitCharge.objects.select_related(
        'unit', 'fee_concept', 'billing_period'
    ).all()
    serializer_class = UnitChargeSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'fee_concept', 'billing_period', 'unit', 'due_date']
    search_fields = ['unit__code', 'fee_concept__name', 'billing_period__name']
    ordering_fields = ['due_date', 'amount', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'])
    def generate_charges(self, request):
        """Generate charges for selected units."""
        # Get data from request (DRF uses request.data, Django uses request.POST)
        data = getattr(request, 'data', request.POST)
        
        # Handle both old and new data formats
        billing_period_id = data.get('billing_period_id')
        billing_period_name = data.get('billing_period')
        fee_concept_id = data.get('fee_concept_id') or data.get('fee_concept')
        due_date = data.get('due_date')
        amount = data.get('amount')
        description = data.get('description', '')
        units = data.get('units', [])
        
        if not fee_concept_id:
            return Response(
                {'error': 'fee_concept_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            fee_concept = FeeConcept.objects.get(id=fee_concept_id)
        except FeeConcept.DoesNotExist:
            return Response(
                {'error': 'Invalid fee_concept_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from units.models import Unit
        
        # If no specific units provided, use all active units
        if not units:
            units = Unit.objects.filter(status__in=['ocupada', 'vacía']).values_list('id', flat=True)
        
        # Create or get billing period
        if billing_period_id:
            # If billing_period_id is provided, use it
            try:
                billing_period = BillingPeriod.objects.get(id=billing_period_id)
            except BillingPeriod.DoesNotExist:
                return Response(
                    {'error': 'Invalid billing_period_id'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Create billing period from name or default
            from datetime import datetime
            period_name = billing_period_name or f'Período {datetime.now().strftime("%Y-%m")}'
            billing_period, created = BillingPeriod.objects.get_or_create(
                name=period_name,
                defaults={
                    'start_date': timezone.now().date(),
                    'end_date': timezone.now().date() + timedelta(days=30),
                    'due_date': due_date or (timezone.now().date() + timedelta(days=30))
                }
            )
        
        created_charges = []
        
        for unit_id in units:
            try:
                unit = Unit.objects.get(id=unit_id)
            except Unit.DoesNotExist:
                continue
            
            # Calculate amount based on concept type and provided amount
            if amount:
                # Use provided amount
                charge_amount = float(amount)
            else:
                # Calculate based on concept type
                if fee_concept.calculation_type == 'coefficient':
                    charge_amount = fee_concept.base_amount * (unit.ownership_coefficient or 1.0) * fee_concept.coefficient_multiplier
                elif fee_concept.calculation_type == 'fixed':
                    charge_amount = fee_concept.base_amount
                else:  # mixed
                    charge_amount = fee_concept.base_amount + (fee_concept.base_amount * (unit.ownership_coefficient or 1.0) * fee_concept.coefficient_multiplier)
            
            charge, created = UnitCharge.objects.get_or_create(
                unit=unit,
                fee_concept=fee_concept,
                billing_period=billing_period,
                defaults={
                    'amount': charge_amount,
                    'due_date': due_date or billing_period.due_date,
                    'status': 'pending',
                    'notes': description
                }
            )
            
            if created:
                created_charges.append(charge)
        
        return Response({
            'message': f'Generated {len(created_charges)} charges',
            'created_charges': len(created_charges),
            'billing_period_id': billing_period.id
        })
    
    @action(detail=True, methods=['post'])
    def apply_interest(self, request):
        """Apply interest to overdue charges."""
        charge = self.get_object()
        
        if charge.status == 'paid':
            return Response(
                {'error': 'Cannot apply interest to paid charges'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get active interest rate
        interest_rate = InterestRate.objects.filter(
            is_active=True,
            effective_date__lte=timezone.now().date()
        ).order_by('-effective_date').first()
        
        if not interest_rate:
            return Response(
                {'error': 'No active interest rate found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate interest
        days_overdue = (timezone.now().date() - charge.due_date).days
        if days_overdue > 0:
            if interest_rate.calculation_base == 'daily':
                interest_amount = charge.amount * (interest_rate.rate / 100) * days_overdue
            else:  # monthly
                interest_amount = charge.amount * (interest_rate.rate / 100) * (days_overdue / 30)
            
            # Apply maximum interest if set
            if interest_rate.max_interest:
                interest_amount = min(interest_amount, interest_rate.max_interest)
            
            charge.interest_amount = interest_amount
            charge.save()
            
            return Response({
                'message': f'Applied interest of {interest_amount}',
                'interest_amount': interest_amount
            })
        
        return Response({'message': 'No interest to apply'})


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payments."""
    
    queryset = Payment.objects.select_related('charge', 'created_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['payment_method', 'created_by', 'payment_date']
    search_fields = ['charge__unit__code', 'reference', 'notes']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'PaymentViewSet.create called with data: {request.data}')
        logger.info(f'User: {request.user}')
        logger.info(f'Content-Type: {request.content_type}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in PaymentViewSet.create: {e}')
            logger.error(f'Request data: {request.data}')
            raise
    
    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'PaymentViewSet.perform_create called')
        logger.info(f'Validated data: {serializer.validated_data}')
        logger.info(f'User: {self.request.user}')
        
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Daily payment summary."""
        date = request.query_params.get('date', timezone.now().date())
        
        payments = Payment.objects.filter(payment_date__date=date)
        
        summary = payments.aggregate(
            total_amount=Sum('amount'),
            total_count=Count('id'),
            cash_amount=Sum('amount', filter=Q(payment_method='cash')),
            transfer_amount=Sum('amount', filter=Q(payment_method='transfer')),
            deposit_amount=Sum('amount', filter=Q(payment_method='deposit')),
            qr_amount=Sum('amount', filter=Q(payment_method='qr')),
            other_amount=Sum('amount', filter=Q(payment_method='other'))
        )
        
        return Response({
            'date': date,
            'summary': summary
        })


class InterestRateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interest rates."""
    
    queryset = InterestRate.objects.all()
    serializer_class = InterestRateSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'calculation_base', 'effective_date']
    search_fields = ['name']
    ordering_fields = ['effective_date', 'rate', 'created_at']
    ordering = ['-effective_date']


class CreditNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing credit notes."""
    
    queryset = CreditNote.objects.select_related('charge', 'approved_by').all()
    serializer_class = CreditNoteSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['approved_by', 'created_at']
    search_fields = ['charge__unit__code', 'reason', 'approved_by__first_name']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(approved_by=self.request.user)


class FineViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fines."""
    
    queryset = Fine.objects.select_related('unit', 'created_by').all()
    serializer_class = FineSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['fine_type', 'status', 'unit', 'created_by', 'fine_date', 'due_date']
    search_fields = ['unit__code', 'description', 'created_by__first_name']
    ordering_fields = ['fine_date', 'due_date', 'amount', 'created_at']
    ordering = ['-fine_date']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)