"""
URL configuration for units app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UnitTowerViewSet,
    UnitBlockViewSet,
    UnitViewSet,
    UnitMembershipViewSet
)

router = DefaultRouter()
router.register(r'towers', UnitTowerViewSet)
router.register(r'blocks', UnitBlockViewSet)
router.register(r'units', UnitViewSet)
router.register(r'unit-memberships', UnitMembershipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]