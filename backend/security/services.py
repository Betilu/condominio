"""
Business logic services for security app.
"""
from django.contrib.auth import get_user_model
from .models import ResidentFace, AccessLog

User = get_user_model()


class SecurityService:
    """Service class for security operations."""
    
    @staticmethod
    def enroll_face(user_id: int, photo_file) -> ResidentFace:
        """
        Enroll a resident's face for recognition.
        
        Args:
            user_id: ID of the user
            photo_file: Uploaded photo file
            
        Returns:
            ResidentFace: Created resident face instance
        """
        user = User.objects.get(id=user_id, is_resident=True)
        
        # Delete existing face if any
        if hasattr(user, 'resident_face'):
            user.resident_face.delete()
        
        # Create new face record
        resident_face = ResidentFace.objects.create(
            user=user,
            photo=photo_file,
            active=True
        )
        
        # TODO: In a real implementation, you would:
        # 1. Process the image to extract facial features
        # 2. Generate embedding using a face recognition library
        # 3. Store the embedding in the embedding field
        # For now, we'll leave embedding as None
        
        return resident_face
    
    @staticmethod
    def create_access_log(location: str, result: str, user_id: int = None,
                         unit_id: int = None, snapshot=None, notes: str = '') -> AccessLog:
        """
        Create an access log entry.
        
        Args:
            location: Access location
            result: Recognition result
            user_id: ID of recognized user (optional)
            unit_id: ID of associated unit (optional)
            snapshot: Snapshot image (optional)
            notes: Additional notes
            
        Returns:
            AccessLog: Created access log instance
        """
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                pass
        
        unit = None
        if unit_id:
            from units.models import Unit
            try:
                unit = Unit.objects.get(id=unit_id)
            except Unit.DoesNotExist:
                pass
        
        access_log = AccessLog.objects.create(
            user=user,
            unit=unit,
            location=location,
            result=result,
            snapshot=snapshot,
            notes=notes
        )
        
        return access_log