#!/usr/bin/env python
"""
Script para probar directamente el registro de asistencia sin HTTP
"""
import os
import sys
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding, VisitorAttendance
from security.face_recognition_service import FaceRecognitionService

def test_direct_attendance():
    """Prueba directa del registro de asistencia"""
    
    print("🎯 Probando registro de asistencia directo...")
    
    # Obtener visitante
    visitor = Visitor.objects.get(document_number="12345678")
    print(f"👤 Visitante: {visitor.first_name} {visitor.last_name} (ID: {visitor.id})")
    
    # Verificar codificación facial
    try:
        face_encoding = VisitorFaceEncoding.objects.get(visitor=visitor)
        print(f"✅ Codificación facial encontrada (threshold: {face_encoding.confidence_threshold})")
    except VisitorFaceEncoding.DoesNotExist:
        print("❌ No se encontró codificación facial")
        return
    
    # Crear servicio
    face_service = FaceRecognitionService()
    
    # Imagen de prueba
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    print("🔍 Probando registro de asistencia...")
    
    try:
        # Probar registro de asistencia
        attendance, confidence = face_service.record_attendance(
            visitor=visitor,
            attendance_type='entry',
            image_data=test_image_data,
            camera_location='Portería Principal',
            notes='Prueba directa'
        )
        
        if attendance:
            print(f"✅ Asistencia registrada exitosamente!")
            print(f"   - ID: {attendance.id}")
            print(f"   - Confianza: {confidence:.3f}")
            print(f"   - Timestamp: {attendance.timestamp}")
        else:
            print(f"❌ No se pudo registrar la asistencia (confianza: {confidence:.3f})")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Verificar asistencias totales
    total_attendances = VisitorAttendance.objects.count()
    print(f"\n📊 Total asistencias: {total_attendances}")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_direct_attendance()
