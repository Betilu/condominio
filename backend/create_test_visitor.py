#!/usr/bin/env python
"""
Script para crear un visitante de prueba con codificación facial
"""
import os
import sys
import django
import base64

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding
from security.face_recognition_service import FaceRecognitionService
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_visitor():
    """Crea un visitante de prueba con codificación facial"""
    
    print("👤 Creando visitante de prueba...")
    
    # Crear visitante
    visitor, created = Visitor.objects.get_or_create(
        document_number="12345678",
        defaults={
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'document_type': 'id',
            'phone': '1234567890',
            'email': 'juan.perez@test.com',
            'is_blacklisted': False,
            'notes': 'Visitante de prueba para reconocimiento facial'
        }
    )
    
    if created:
        print(f"✅ Visitante creado: {visitor.first_name} {visitor.last_name}")
    else:
        print(f"ℹ️ Visitante ya existe: {visitor.first_name} {visitor.last_name}")
    
    # Crear una imagen de prueba más realista (imagen JPEG válida de 1x1 pixel)
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    print("🔍 Registrando codificación facial...")
    
    try:
        face_service = FaceRecognitionService()
        
        # Registrar codificación facial
        success = face_service.register_visitor_face(visitor, test_image_data)
        
        if success:
            print("✅ Codificación facial registrada exitosamente")
            
            # Verificar que se creó la codificación
            try:
                face_encoding = VisitorFaceEncoding.objects.get(visitor=visitor)
                print(f"✅ Codificación verificada - Threshold: {face_encoding.confidence_threshold}")
            except VisitorFaceEncoding.DoesNotExist:
                print("❌ Error: No se encontró la codificación facial")
        else:
            print("❌ Error registrando codificación facial")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Proceso completado")

if __name__ == "__main__":
    create_test_visitor()
