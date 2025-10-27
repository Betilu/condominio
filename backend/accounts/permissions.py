"""
Custom permissions for accounts app.
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission that allows full access to admin users or superusers,
    and read-only access to authenticated users.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return (request.user.is_superuser or 
                request.user.groups.filter(name='Admin').exists())


class IsAdminUser(permissions.BasePermission):
    """
    Permission that allows access only to admin users or superusers.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.is_superuser or 
             request.user.groups.filter(name='Admin').exists())
        )