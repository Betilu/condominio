"""
Views for units app.
"""
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import UnitTower, UnitBlock, Unit, UnitMembership
from .serializers import (
    UnitTowerSerializer,
    UnitBlockSerializer, 
    UnitSerializer,
    UnitMembershipSerializer
)
from accounts.permissions import IsAdminUser


class UnitTowerViewSet(viewsets.ModelViewSet):
    """ViewSet for managing towers."""
    
    queryset = UnitTower.objects.all()
    serializer_class = UnitTowerSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class UnitBlockViewSet(viewsets.ModelViewSet):
    """ViewSet for managing blocks."""
    
    queryset = UnitBlock.objects.select_related('tower').all()
    serializer_class = UnitBlockSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tower']
    search_fields = ['name', 'description', 'tower__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['tower__name', 'name']


class UnitViewSet(viewsets.ModelViewSet):
    """ViewSet for managing units."""
    
    queryset = Unit.objects.select_related(
        'block__tower', 'owner', 'tenant'
    ).all()
    serializer_class = UnitSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['block', 'block__tower', 'category', 'status']
    search_fields = ['code', 'number', 'block__name', 'block__tower__name']
    ordering_fields = ['code', 'created_at']
    ordering = ['block__tower__name', 'block__name', 'code']


class UnitMembershipViewSet(viewsets.ModelViewSet):
    """ViewSet for managing unit memberships."""
    
    queryset = UnitMembership.objects.select_related('unit', 'user').all()
    serializer_class = UnitMembershipSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['unit', 'user', 'role_in_unit']
    search_fields = ['unit__code', 'user__first_name', 'user__last_name']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']