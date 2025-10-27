#!/usr/bin/env python
"""
Script para probar el endpoint HTTP de registro de asistencia
"""
import os
import sys
import django
import requests
import json
import base64

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor

def test_http_attendance():
    """Prueba el endpoint HTTP de registro de asistencia"""
    
    print("🎯 Probando endpoint HTTP de registro de asistencia...")
    
    # Obtener visitante
    visitor = Visitor.objects.get(document_number="12345678")
    print(f"👤 Visitante: {visitor.first_name} {visitor.last_name} (ID: {visitor.id})")
    
    # Crear imagen de prueba (base64 de una imagen simple)
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    # URL del endpoint
    url = "http://localhost:8000/api/security/attendance/record_attendance/"
    data = {
        'visitor_id': visitor.id,
        'attendance_type': 'entry',
        'image_data': test_image_data,
        'camera_location': 'Portería Principal',
        'notes': 'Prueba HTTP con sistema simplificado'
    }
    
    print(f"📡 URL: {url}")
    print(f"📊 Datos: visitor_id={visitor.id}, attendance_type=entry")
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Asistencia registrada exitosamente desde HTTP!")
        else:
            print("❌ Error registrando asistencia desde HTTP")
            
    except Exception as e:
        print(f"❌ Error en la llamada: {str(e)}")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_http_attendance()
