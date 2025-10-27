"""
URL configuration for accounts app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import UserViewSet, GroupViewSet, ChangePasswordView, UserRoleViewSet, PermissionsView, UserPermissionsView, CurrentUserView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', GroupViewSet)
router.register(r'user-roles', UserRoleViewSet)

urlpatterns = [
    # JWT Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Current user endpoint
    path('me/', CurrentUserView.as_view(), name='current-user'),
    # Change password endpoint
    path('users/<int:pk>/change-password/', ChangePasswordView.as_view(), name='user-change-password'),
    # User permissions endpoint
    path('users/<int:pk>/permissions/', UserPermissionsView.as_view(), name='user-permissions'),
    # Permissions endpoint
    path('permissions/', PermissionsView.as_view(), name='permissions'),
    # API endpoints
    path('', include(router.urls)),
]