#!/usr/bin/env python
"""
Script para probar con la URL correcta
"""
import os
import sys
import django
import requests
import json

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor

def test_correct_url():
    """Prueba con la URL correcta"""
    
    print("🎯 Probando con URL correcta...")
    
    # Obtener visitante
    visitor = Visitor.objects.get(document_number="12345678")
    print(f"👤 Visitante: {visitor.first_name} {visitor.last_name} (ID: {visitor.id})")
    
    # URL correcta
    url = "http://localhost:8000/api/security/attendance/record_attendance/"
    data = {
        'visitor_id': visitor.id,
        'attendance_type': 'entry',
        'image_data': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        'camera_location': 'Portería Principal',
        'notes': 'Prueba desde frontend'
    }
    
    print(f"📡 URL: {url}")
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Éxito!")
        else:
            print("❌ Error")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_correct_url()
