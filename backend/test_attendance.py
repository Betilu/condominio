#!/usr/bin/env python
"""
Script para probar el registro de asistencia
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding, VisitorAttendance
from security.face_recognition_service import FaceRecognitionService
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_attendance_registration():
    """Prueba el registro de asistencia"""
    
    print("🎯 Probando registro de asistencia...")
    
    # Obtener visitante con codificación facial
    try:
        visitor = Visitor.objects.get(document_number="12345678")
        print(f"👤 Visitante encontrado: {visitor.first_name} {visitor.last_name}")
        
        # Verificar codificación facial
        try:
            face_encoding = VisitorFaceEncoding.objects.get(visitor=visitor)
            print(f"✅ Codificación facial encontrada (threshold: {face_encoding.confidence_threshold})")
        except VisitorFaceEncoding.DoesNotExist:
            print("❌ No se encontró codificación facial")
            return
            
    except Visitor.DoesNotExist:
        print("❌ No se encontró el visitante de prueba")
        return
    
    # Crear imagen de prueba (misma que se usó para registrar)
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    print("🔍 Probando registro de asistencia...")
    
    try:
        face_service = FaceRecognitionService()
        
        # Probar registro de asistencia
        attendance, confidence = face_service.record_attendance(
            visitor=visitor,
            attendance_type='entry',
            image_data=test_image_data,
            camera_location='Portería Principal',
            notes='Prueba de asistencia'
        )
        
        if attendance:
            print(f"✅ Asistencia registrada exitosamente!")
            print(f"   - ID: {attendance.id}")
            print(f"   - Tipo: {attendance.get_attendance_type_display()}")
            print(f"   - Confianza: {confidence:.3f}")
            print(f"   - Timestamp: {attendance.timestamp}")
        else:
            print(f"❌ No se pudo registrar la asistencia (confianza: {confidence:.3f})")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_attendance_registration()
