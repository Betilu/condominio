#!/usr/bin/env python
"""
Script completo para probar el sistema de reconocimiento facial
"""
import os
import sys
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding, VisitorAttendance
from security.face_recognition_service import FaceRecognitionService
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_complete_face_system():
    """Prueba completa del sistema de reconocimiento facial"""
    
    print("🔍 Probando sistema completo de reconocimiento facial...")
    
    # 1. Verificar visitantes con codificación facial
    face_encodings = VisitorFaceEncoding.objects.all()
    print(f"\n📊 Visitantes con codificación facial: {face_encodings.count()}")
    
    for encoding in face_encodings:
        print(f"  - {encoding.visitor.first_name} {encoding.visitor.last_name}")
        print(f"    ID: {encoding.visitor.id}")
        print(f"    Threshold: {encoding.confidence_threshold}")
        print(f"    Codificación: {len(encoding.face_encoding)} caracteres")
    
    # 2. Verificar asistencias existentes
    attendances = VisitorAttendance.objects.all()
    print(f"\n📊 Asistencias registradas: {attendances.count()}")
    
    for attendance in attendances:
        print(f"  - {attendance.visitor.first_name} {attendance.visitor.last_name}")
        print(f"    Tipo: {attendance.attendance_type}")
        print(f"    Confianza: {attendance.confidence_score:.3f}")
        print(f"    Fecha: {attendance.timestamp}")
    
    # 3. Probar servicio de reconocimiento
    if face_encodings.count() > 0:
        print(f"\n🧪 Probando reconocimiento facial...")
        
        # Usar el primer visitante con codificación
        test_visitor = face_encodings.first().visitor
        print(f"Visitante de prueba: {test_visitor.first_name} {test_visitor.last_name}")
        
        # Crear imagen de prueba
        test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        
        try:
            face_service = FaceRecognitionService()
            
            # Probar registro de asistencia
            print("🎯 Probando registro de asistencia...")
            attendance, confidence = face_service.record_attendance(
                visitor=test_visitor,
                attendance_type='entry',
                image_data=test_image_data,
                camera_location='Portería Principal',
                notes='Prueba de asistencia'
            )
            
            if attendance:
                print(f"✅ Asistencia registrada exitosamente!")
                print(f"   - ID: {attendance.id}")
                print(f"   - Confianza: {confidence:.3f}")
            else:
                print(f"❌ No se pudo registrar la asistencia")
                
        except Exception as e:
            print(f"❌ Error en prueba: {str(e)}")
    else:
        print("\n⚠️ No hay visitantes con codificación facial para probar")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_complete_face_system()
