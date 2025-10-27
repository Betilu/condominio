"""
URL configuration for finance app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FeeConceptViewSet, BillingPeriodViewSet, UnitChargeViewSet, PaymentViewSet,
    InterestRateViewSet, CreditNoteViewSet, FineViewSet
)

router = DefaultRouter()
router.register(r'fee-concepts', FeeConceptViewSet)
router.register(r'billing-periods', BillingPeriodViewSet)
router.register(r'unit-charges', UnitChargeViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'interest-rates', InterestRateViewSet)
router.register(r'credit-notes', CreditNoteViewSet)
router.register(r'fines', FineViewSet)

urlpatterns = [
    path('', include(router.urls)),
]