"""
Views for security app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Visitor, AccessAuthorization, AccessEvent, 
    SecurityGuard, SecurityIncident, VisitorFaceEncoding, VisitorAttendance
)
from .serializers import (
    VisitorSerializer, AccessAuthorizationSerializer, AccessEventSerializer,
    SecurityGuardSerializer, SecurityIncidentSerializer, VisitorFaceEncodingSerializer,
    VisitorAttendanceSerializer
)
from .simple_face_recognition_service import SimpleFaceRecognitionService as FaceRecognitionService
from accounts.permissions import IsAdminUser


class VisitorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing visitors."""
    
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_blacklisted', 'document_type']
    search_fields = ['first_name', 'last_name', 'document_number', 'phone', 'email']
    ordering_fields = ['first_name', 'last_name', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'VisitorViewSet.create called with data: {request.data}')
        logger.info(f'User: {request.user}')
        logger.info(f'Content-Type: {request.content_type}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in VisitorViewSet.create: {e}')
            logger.error(f'Request data: {request.data}')
            raise
    
    def update(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'VisitorViewSet.update called with data: {request.data}')
        logger.info(f'User: {request.user}')
        logger.info(f'Content-Type: {request.content_type}')
        logger.info(f'Partial: {kwargs.get("partial", False)}')
        
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in VisitorViewSet.update: {e}')
            logger.error(f'Request data: {request.data}')
            raise


class AccessAuthorizationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing access authorizations."""
    
    queryset = AccessAuthorization.objects.select_related(
        'visitor', 'unit', 'authorized_by'
    ).all()
    serializer_class = AccessAuthorizationSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'unit', 'authorized_by']
    search_fields = ['visitor__first_name', 'visitor__last_name', 'unit__code', 'purpose']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-created_at']
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'AccessAuthorizationViewSet.create called with data: {request.data}')
        logger.info(f'User: {request.user}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in AccessAuthorizationViewSet.create: {e}')
            logger.error(f'Request data: {request.data}')
            raise
    
    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'AccessAuthorizationViewSet.perform_create called')
        logger.info(f'User: {self.request.user}')
        
        # Establecer el authorized_by automáticamente
        serializer.save(authorized_by=self.request.user)


class AccessEventViewSet(viewsets.ModelViewSet):
    """ViewSet for managing access events."""
    
    queryset = AccessEvent.objects.select_related(
        'visitor', 'authorization__visitor', 'authorization__unit', 'processed_by'
    ).all()
    serializer_class = AccessEventSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'detection_type', 'camera_location']
    search_fields = ['visitor__first_name', 'visitor__last_name', 'camera_location', 'notes']
    ordering_fields = ['timestamp', 'confidence_score']
    ordering = ['-timestamp']
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'AccessEventViewSet.create called with data: {request.data}')
        logger.info(f'User: {request.user}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in AccessEventViewSet.create: {e}')
            logger.error(f'Request data: {request.data}')
            raise
    
    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'AccessEventViewSet.perform_create called')
        logger.info(f'User: {self.request.user}')
        
        # Establecer el processed_by automáticamente
        serializer.save(processed_by=self.request.user)


class SecurityGuardViewSet(viewsets.ModelViewSet):
    """ViewSet for managing security guards."""
    
    queryset = SecurityGuard.objects.select_related('user').all()
    serializer_class = SecurityGuardSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'shift_start', 'shift_end']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']
    ordering_fields = ['employee_id', 'created_at']
    ordering = ['employee_id']


class SecurityIncidentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing security incidents."""
    
    queryset = SecurityIncident.objects.select_related(
        'reported_by', 'assigned_to'
    ).all()
    serializer_class = SecurityIncidentSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['incident_type', 'severity', 'status', 'reported_by', 'assigned_to']
    search_fields = ['description', 'location', 'reported_by__first_name']
    ordering_fields = ['incident_date', 'severity', 'created_at']
    ordering = ['-incident_date']
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'SecurityIncidentViewSet.create called with data: {request.data}')
        logger.info(f'User: {request.user}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in SecurityIncidentViewSet.create: {e}')
            logger.error(f'Request data: {request.data}')
            raise
    
    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'SecurityIncidentViewSet.perform_create called')
        logger.info(f'User: {self.request.user}')
        
        # Establecer el reported_by automáticamente
        serializer.save(reported_by=self.request.user)


class VisitorFaceEncodingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing visitor face encodings."""
    
    queryset = VisitorFaceEncoding.objects.all()
    serializer_class = VisitorFaceEncodingSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['visitor']
    search_fields = ['visitor__first_name', 'visitor__last_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'])
    def register_face(self, request):
        """Registra la codificación facial de un visitante."""
        try:
            visitor_id = request.data.get('visitor_id')
            image_data = request.data.get('image_data')
            
            if not visitor_id or not image_data:
                return Response({
                    'error': 'visitor_id e image_data son requeridos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            visitor = Visitor.objects.get(id=visitor_id)
            face_service = FaceRecognitionService()
            
            success = face_service.register_visitor_face(visitor, image_data)
            
            if success:
                return Response({
                    'message': 'Codificación facial registrada exitosamente',
                    'visitor': visitor.get_full_name()
                })
            else:
                return Response({
                    'error': 'No se pudo registrar la codificación facial'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Visitor.DoesNotExist:
            return Response({
                'error': 'Visitante no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Error registrando codificación facial: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def recognize_visitor(self, request):
        """Reconoce un visitante a partir de una imagen."""
        try:
            image_data = request.data.get('image_data')
            threshold = float(request.data.get('threshold', 0.6))
            
            if not image_data:
                return Response({
                    'error': 'image_data es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            face_service = FaceRecognitionService()
            visitor, confidence = face_service.recognize_visitor(image_data, threshold)
            
            if visitor:
                return Response({
                    'visitor': {
                        'id': visitor.id,
                        'name': visitor.get_full_name(),
                        'document_number': visitor.document_number
                    },
                    'confidence': confidence,
                    'recognized': True
                })
            else:
                return Response({
                    'visitor': None,
                    'confidence': 0.0,
                    'recognized': False,
                    'message': 'No se pudo reconocer al visitante'
                })
                
        except Exception as e:
            return Response({
                'error': f'Error reconociendo visitante: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VisitorAttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing visitor attendance."""
    
    queryset = VisitorAttendance.objects.all()
    serializer_class = VisitorAttendanceSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['visitor', 'attendance_type', 'processed_by']
    search_fields = ['visitor__first_name', 'visitor__last_name', 'notes']
    ordering_fields = ['timestamp', 'confidence_score']
    ordering = ['-timestamp']
    
    def perform_create(self, serializer):
        """Establece el processed_by automáticamente."""
        serializer.save(processed_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def record_attendance(self, request):
        """Registra la asistencia de un visitante usando reconocimiento facial."""
        try:
            visitor_id = request.data.get('visitor_id')
            attendance_type = request.data.get('attendance_type', 'entry')
            image_data = request.data.get('image_data')
            camera_location = request.data.get('camera_location', '')
            notes = request.data.get('notes', '')
            
            if not visitor_id or not image_data:
                return Response({
                    'error': 'visitor_id e image_data son requeridos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if attendance_type not in ['entry', 'exit']:
                return Response({
                    'error': 'attendance_type debe ser "entry" o "exit"'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            visitor = Visitor.objects.get(id=visitor_id)
            face_service = FaceRecognitionService()
            
            attendance, confidence = face_service.record_attendance(
                visitor, attendance_type, image_data, camera_location, notes
            )
            print(attendance, confidence)
            
            if attendance:
                return Response({
                    'message': f'Asistencia registrada exitosamente',
                    'attendance': {
                        'id': attendance.id,
                        'visitor': visitor.get_full_name(),
                        'type': attendance.get_attendance_type_display(),
                        'timestamp': attendance.timestamp,
                        'confidence': confidence
                    }
                })
            else:
                return Response({
                    'error': 'No se pudo registrar la asistencia. Verifique que el visitante esté registrado con codificación facial.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Visitor.DoesNotExist:
            return Response({
                'error': 'Visitante no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Error registrando asistencia: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def today_attendance(self, request):
        """Obtiene la asistencia de hoy."""
        from django.utils import timezone
        from datetime import date
        
        today = timezone.now().date()
        attendance = VisitorAttendance.objects.filter(timestamp__date=today)
        
        serializer = self.get_serializer(attendance, many=True)
        return Response({
            'date': today,
            'attendance': serializer.data,
            'total_entries': attendance.filter(attendance_type='entry').count(),
            'total_exits': attendance.filter(attendance_type='exit').count()
        })