"""
Views for accounts app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers

from .serializers import (
    UserSerializer, 
    GroupSerializer, 
    UserGroupAssignmentSerializer,
    UserRoleSerializer
)
from .permissions import IsAdminUser, IsAdminOrReadOnly

User = get_user_model()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    password = serializers.CharField(min_length=8, write_only=True)
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users.
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_resident', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'document_number']

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def change_password(self, request, pk=None):
        """
        Change user password.
        """
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            password = serializer.validated_data['password']
            user.set_password(password)
            user.save()
            
            return Response({
                'message': f'Contraseña actualizada para el usuario "{user.username}"'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    View for changing user password.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            password = serializer.validated_data['password']
            user.set_password(password)
            user.save()
            
            return Response({
                'message': f'Contraseña actualizada para el usuario "{user.username}"'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    View for getting current authenticated user profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class UserPermissionsView(APIView):
    """
    View for getting user's effective permissions.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Get all effective permissions for the user
        permissions = user.get_effective_permissions()
        
        data = []
        for perm in permissions:
            data.append({
                'id': perm.id,
                'name': perm.name,
                'codename': perm.codename,
                'content_type': {
                    'app_label': perm.content_type.app_label,
                    'model': perm.content_type.model
                }
            })
        
        return Response(data)


class PermissionsView(APIView):
    """
    View for getting all available permissions.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        permissions = Permission.objects.all().order_by('content_type__app_label', 'codename')
        data = []
        for perm in permissions:
            data.append({
                'id': perm.id,
                'name': perm.name,
                'codename': perm.codename,
                'content_type': {
                    'app_label': perm.content_type.app_label,
                    'model': perm.content_type.model
                }
            })
        return Response(data)


class UserRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing custom user roles.
    """
    from .models import UserRole
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing groups (roles).
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def assign(self, request):
        """
        Assign a group to a user.
        """
        serializer = UserGroupAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            group_id = serializer.validated_data['group_id']
            
            user = User.objects.get(id=user_id)
            group = Group.objects.get(id=group_id)
            
            user.groups.add(group)
            
            return Response({
                'message': f'Grupo "{group.name}" asignado al usuario "{user.username}"'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def unassign(self, request):
        """
        Remove a group from a user.
        """
        serializer = UserGroupAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            group_id = serializer.validated_data['group_id']
            
            user = User.objects.get(id=user_id)
            group = Group.objects.get(id=group_id)
            
            user.groups.remove(group)
            
            return Response({
                'message': f'Grupo "{group.name}" removido del usuario "{user.username}"'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)