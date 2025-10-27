#!/usr/bin/env python
"""
Script para probar la actualización de visitantes
"""
import os
import sys
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding

def test_visitor_update():
    """Prueba la actualización de visitantes"""
    
    print("🔍 Probando actualización de visitantes...")
    
    # Obtener visitante existente
    try:
        visitor = Visitor.objects.get(document_number="12345678")
        print(f"👤 Visitante encontrado: {visitor.first_name} {visitor.last_name} (ID: {visitor.id})")
        print(f"📸 Foto actual: {visitor.photo}")
        print(f"🔗 Photo URL: {visitor.photo.url if visitor.photo else 'None'}")
        
        # Verificar codificación facial
        try:
            face_encoding = VisitorFaceEncoding.objects.get(visitor=visitor)
            print(f"✅ Codificación facial encontrada (threshold: {face_encoding.confidence_threshold})")
        except VisitorFaceEncoding.DoesNotExist:
            print("❌ No se encontró codificación facial")
        
        # Simular actualización
        print("\n🔄 Simulando actualización...")
        visitor.first_name = "Juan Carlos"
        visitor.last_name = "Pérez García"
        visitor.phone = "987654321"
        visitor.save()
        
        print(f"✅ Visitante actualizado: {visitor.first_name} {visitor.last_name}")
        print(f"📞 Teléfono actualizado: {visitor.phone}")
        
    except Visitor.DoesNotExist:
        print("❌ No se encontró el visitante de prueba")
    
    print("\n✅ Prueba completada")

if __name__ == "__main__":
    test_visitor_update()
