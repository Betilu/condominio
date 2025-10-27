#!/usr/bin/env python
"""
Script para simular el registro de asistencia desde el frontend
"""
import os
import sys
import django
import requests
import json

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding

def test_frontend_attendance():
    """Simula el registro de asistencia desde el frontend"""
    
    print("🎯 Simulando registro de asistencia desde frontend...")
    
    # Obtener visitante con codificación facial
    try:
        visitor = Visitor.objects.get(document_number="12345678")
        print(f"👤 Visitante encontrado: {visitor.first_name} {visitor.last_name} (ID: {visitor.id})")
        
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
    
    # Simular datos del frontend
    test_image_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    # Simular llamada al endpoint de registro de asistencia
    url = "http://localhost:8000/api/security/attendance/record_attendance/"
    data = {
        'visitor_id': visitor.id,
        'attendance_type': 'entry',
        'image_data': test_image_data,
        'camera_location': 'Portería Principal',
        'notes': 'Prueba desde frontend'
    }
    
    print(f"📡 Enviando datos a: {url}")
    print(f"📊 Datos: visitor_id={visitor.id}, attendance_type=entry")
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Asistencia registrada exitosamente desde frontend")
        else:
            print("❌ Error registrando asistencia desde frontend")
            
    except Exception as e:
        print(f"❌ Error en la llamada: {str(e)}")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_frontend_attendance()
