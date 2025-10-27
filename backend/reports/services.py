"""
Business logic services for reports app.
"""
from datetime import datetime, date
from django.db.models import Sum, Count, Q
from django.utils import timezone

from finance.models import UnitCharge, Payment
from security.models import AccessLog
from amenities.models import AmenityReservation
from maintenance.models import WorkOrder


class ReportsService:
    """Service class for generating reports."""
    
    @staticmethod
    def finance_morosity(period: str = None) -> dict:
        """
        Generate financial morosity report.
        
        Args:
            period: Period in format YYYY-MM (optional)
            
        Returns:
            dict: Morosity report data
        """
        charges_query = UnitCharge.objects.all()
        
        if period:
            charges_query = charges_query.filter(billing_period__name__icontains=period)
        
        total_charges = charges_query.count()
        total_amount = charges_query.aggregate(Sum('amount'))['amount__sum'] or 0
        
        pending_charges = charges_query.filter(status='pendiente')
        pending_count = pending_charges.count()
        pending_amount = pending_charges.aggregate(Sum('amount'))['amount__sum'] or 0
        
        paid_charges = charges_query.filter(status='pagado')
        paid_count = paid_charges.count()
        paid_amount = paid_charges.aggregate(Sum('amount'))['amount__sum'] or 0
        
        overdue_charges = charges_query.filter(status='vencido')
        overdue_count = overdue_charges.count()
        overdue_amount = overdue_charges.aggregate(Sum('amount'))['amount__sum'] or 0
        
        morosity_rate = (pending_count / total_charges * 100) if total_charges > 0 else 0
        
        return {
            'period': period,
            'total_charges': total_charges,
            'total_amount': float(total_amount),
            'pending': {
                'count': pending_count,
                'amount': float(pending_amount)
            },
            'paid': {
                'count': paid_count,
                'amount': float(paid_amount)
            },
            'overdue': {
                'count': overdue_count,
                'amount': float(overdue_amount)
            },
            'morosity_rate': round(morosity_rate, 2)
        }
    
    @staticmethod
    def access_trends(from_date: date = None, to_date: date = None) -> dict:
        """
        Generate access trends report.
        
        Args:
            from_date: Start date (optional)
            to_date: End date (optional)
            
        Returns:
            dict: Access trends data
        """
        logs_query = AccessLog.objects.all()
        
        if from_date:
            logs_query = logs_query.filter(event_time__date__gte=from_date)
        if to_date:
            logs_query = logs_query.filter(event_time__date__lte=to_date)
        
        total_events = logs_query.count()
        
        # Group by result
        by_result = logs_query.values('result').annotate(
            count=Count('id')
        ).order_by('result')
        
        # Group by location
        by_location = logs_query.values('location').annotate(
            count=Count('id')
        ).order_by('location')
        
        # Daily trends (last 30 days if no dates specified)
        if not from_date and not to_date:
            from_date = timezone.now().date() - timezone.timedelta(days=30)
            to_date = timezone.now().date()
        
        daily_logs = logs_query.filter(
            event_time__date__gte=from_date,
            event_time__date__lte=to_date
        ).extra(
            select={'day': 'date(event_time)'}
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        return {
            'from_date': from_date.isoformat() if from_date else None,
            'to_date': to_date.isoformat() if to_date else None,
            'total_events': total_events,
            'by_result': list(by_result),
            'by_location': list(by_location),
            'daily_trends': list(daily_logs)
        }
    
    @staticmethod
    def amenities_usage(from_date: date = None, to_date: date = None) -> dict:
        """
        Generate amenities usage report.
        
        Args:
            from_date: Start date (optional)
            to_date: End date (optional)
            
        Returns:
            dict: Amenities usage data
        """
        reservations_query = AmenityReservation.objects.filter(
            status__in=['approved', 'pending']
        )
        
        if from_date:
            reservations_query = reservations_query.filter(start_dt__date__gte=from_date)
        if to_date:
            reservations_query = reservations_query.filter(start_dt__date__lte=to_date)
        
        total_reservations = reservations_query.count()
        total_revenue = reservations_query.aggregate(Sum('price'))['price__sum'] or 0
        
        # Group by amenity
        by_amenity = reservations_query.values(
            'amenity__name'
        ).annotate(
            count=Count('id'),
            revenue=Sum('price')
        ).order_by('-count')
        
        # Group by status
        by_status = reservations_query.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Most active units
        by_unit = reservations_query.values(
            'unit__code'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return {
            'from_date': from_date.isoformat() if from_date else None,
            'to_date': to_date.isoformat() if to_date else None,
            'total_reservations': total_reservations,
            'total_revenue': float(total_revenue),
            'by_amenity': list(by_amenity),
            'by_status': list(by_status),
            'top_units': list(by_unit)
        }
    
    @staticmethod
    def maintenance_summary(from_date: date = None, to_date: date = None) -> dict:
        """
        Generate maintenance summary report.
        
        Args:
            from_date: Start date (optional)
            to_date: End date (optional)
            
        Returns:
            dict: Maintenance summary data
        """
        work_orders_query = WorkOrder.objects.all()
        
        if from_date:
            work_orders_query = work_orders_query.filter(created_at__date__gte=from_date)
        if to_date:
            work_orders_query = work_orders_query.filter(created_at__date__lte=to_date)
        
        total_orders = work_orders_query.count()
        
        # Group by status
        by_status = work_orders_query.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Group by type
        by_type = work_orders_query.values('type').annotate(
            count=Count('id')
        ).order_by('type')
        
        # Group by priority
        by_priority = work_orders_query.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        
        return {
            'from_date': from_date.isoformat() if from_date else None,
            'to_date': to_date.isoformat() if to_date else None,
            'total_orders': total_orders,
            'by_status': list(by_status),
            'by_type': list(by_type),
            'by_priority': list(by_priority)
        }