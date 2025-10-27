#!/usr/bin/env python
"""
Script de prueba para el sistema de reconocimiento facial
"""
import os
import sys
import django
import json

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

def test_face_recognition_system():
    """Prueba el sistema de reconocimiento facial"""
    
    print("🔍 Probando sistema de reconocimiento facial...")
    
    # Verificar visitantes con codificación facial
    visitors_with_encoding = VisitorFaceEncoding.objects.all()
    print(f"📊 Visitantes con codificación facial: {visitors_with_encoding.count()}")
    
    for encoding in visitors_with_encoding:
        print(f"  - {encoding.visitor.first_name} {encoding.visitor.last_name} (threshold: {encoding.confidence_threshold})")
    
    # Verificar asistencias registradas
    attendances = VisitorAttendance.objects.all()
    print(f"📊 Asistencias registradas: {attendances.count()}")
    
    for attendance in attendances:
        print(f"  - {attendance.visitor.first_name} {attendance.visitor.last_name} - {attendance.attendance_type} (confianza: {attendance.confidence_score:.3f})")
    
    # Probar servicio de reconocimiento
    face_service = FaceRecognitionService()
    
    # Crear una imagen de prueba (base64 simple)
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    print("\n🧪 Probando reconocimiento con imagen de prueba...")
    
    try:
        # Extraer codificación facial
        face_encoding = face_service.extract_face_encoding(test_image_data)
        if face_encoding:
            print("✅ Codificación facial extraída exitosamente")
            print(f"   - Landmarks: {len(face_encoding.get('landmarks', []))}")
            print(f"   - Distancia entre ojos: {face_encoding.get('eye_distance', 'N/A')}")
            print(f"   - Área facial: {face_encoding.get('face_area', 'N/A')}")
        else:
            print("❌ No se pudo extraer codificación facial")
            
    except Exception as e:
        print(f"❌ Error en prueba: {str(e)}")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_face_recognition_system()
