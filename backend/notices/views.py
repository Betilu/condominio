"""
Views for notices app.
"""
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Notice
from .serializers import NoticeSerializer
from accounts.permissions import IsAdminUser


class NoticeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notices."""
    
    queryset = Notice.objects.select_related(
        'created_by', 'target_tower', 'target_block', 'target_unit'
    ).all()
    serializer_class = NoticeSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'audience_scope', 'target_tower', 'target_block', 'target_unit'
    ]
    search_fields = ['title', 'body']
    ordering_fields = ['publish_at', 'created_at']
    ordering = ['-publish_at']
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'NoticeViewSet.create called with data: {request.data}')
        logger.info(f'User: {request.user}')
        logger.info(f'Content-Type: {request.content_type}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in NoticeViewSet.create: {e}')
            logger.error(f'Request data: {request.data}')
            raise
    
    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'NoticeViewSet.perform_create called')
        logger.info(f'Validated data: {serializer.validated_data}')
        logger.info(f'User: {self.request.user}')
        
        serializer.save(created_by=self.request.user)