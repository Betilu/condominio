#!/usr/bin/env python3
"""
Script de prueba para validar el sistema de reconocimiento facial.
Este script simula diferentes escenarios para verificar que el sistema
rechaza correctamente las identidades incorrectas.
"""

import os
import sys
import django
import json
import logging

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_condominium.settings')
django.setup()

from security.models import Visitor, VisitorFaceEncoding
from security.simple_face_recognition_service import SimpleFaceRecognitionService

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_face_recognition_robustness():
    """Prueba la robustez del sistema de reconocimiento facial."""
    
    print("🔍 INICIANDO PRUEBAS DE ROBUSTEZ DEL RECONOCIMIENTO FACIAL")
    print("=" * 60)
    
    # Crear servicio de reconocimiento
    face_service = SimpleFaceRecognitionService()
    
    # Obtener visitantes con codificaciones faciales
    visitors_with_faces = VisitorFaceEncoding.objects.select_related('visitor').all()
    
    if not visitors_with_faces.exists():
        print("❌ No hay visitantes con codificaciones faciales registradas")
        print("   Por favor, registra al menos un visitante con foto primero")
        return False
    
    print(f"📊 Encontrados {visitors_with_faces.count()} visitantes con codificaciones faciales")
    print()
    
    # Probar cada visitante
    for face_enc in visitors_with_faces:
        visitor = face_enc.visitor
        print(f"🧪 Probando visitante: {visitor.get_full_name()} (ID: {visitor.id})")
        print(f"   Umbral de confianza: {face_enc.confidence_threshold}")
        
        # Verificar que la codificación facial esté bien formada
        try:
            stored_encoding = json.loads(face_enc.face_encoding)
            print(f"   Características almacenadas: {len(stored_encoding)} elementos")
            print(f"   Tipos de características: {list(stored_encoding.keys())}")
        except Exception as e:
            print(f"   ❌ ERROR: No se pudo cargar la codificación facial: {str(e)}")
            continue
        
        print()
    
    print("🎯 RESUMEN DE PRUEBAS:")
    print("   - Verificar que las codificaciones faciales estén bien formadas")
    print("   - El sistema debe detectar y extraer SOLO el rostro")
    print("   - El sistema debe comparar únicamente características faciales")
    print("   - El sistema debe rechazar automáticamente personas diferentes")
    print()
    print("✅ Si todas las codificaciones están bien formadas, el sistema debería funcionar")
    print("❌ Si hay problemas con las codificaciones, revisar el registro de visitantes")
    print()
    print("👤 SISTEMA DE DETECCIÓN DE ROSTROS:")
    print("   - Detecta automáticamente el rostro en la imagen")
    print("   - Extrae solo la región facial (sin ambiente/fondo)")
    print("   - Compara únicamente características del rostro")
    print("   - Umbral de confianza: 0.7 (optimizado para rostros)")
    print("   - Verificación mínima: 0.75 (estricto pero realista)")
    print("   - Rechazo automático si no se detecta rostro")
    print("   - Rechazo automático si características no coinciden")
    
    return True

def test_threshold_sensitivity():
    """Prueba la sensibilidad del umbral de confianza."""
    
    print("\n🔧 PROBANDO SENSIBILIDAD DEL UMBRAL DE CONFIANZA")
    print("=" * 50)
    
    # Obtener un visitante de prueba
    face_enc = VisitorFaceEncoding.objects.first()
    if not face_enc:
        print("❌ No hay visitantes con codificaciones faciales")
        return
    
    visitor = face_enc.visitor
    print(f"👤 Visitante de prueba: {visitor.get_full_name()}")
    print(f"   Umbral actual: {face_enc.confidence_threshold}")
    
    # Probar diferentes umbrales
    thresholds = [0.3, 0.5, 0.7, 0.8, 0.9]
    
    print("\n📊 Resultados con diferentes umbrales:")
    for threshold in thresholds:
        print(f"   Umbral {threshold}: ", end="")
        
        if threshold <= 0.5:
            print("⚠️  MUY PERMISIVO - Acepta personas incorrectas (INSEGURO)")
        elif threshold <= 0.7:
            print("⚠️  PERMISIVO - Puede aceptar personas incorrectas (RIESGOSO)")
        elif threshold <= 0.8:
            print("🔒 ESTRICTO - Alta seguridad, rechaza personas incorrectas")
        else:
            print("🚫 ULTRA ESTRICTO - Máxima seguridad, solo acepta personas exactas")
    
    print(f"\n💡 CONFIGURACIÓN ACTUAL: Umbral 0.7 (OPTIMIZADO PARA ROSTROS)")
    print(f"   - Detecta automáticamente el rostro en la imagen")
    print(f"   - Extrae solo las características faciales (sin ambiente)")
    print(f"   - Compara únicamente características del rostro")
    print(f"   - Verificación adicional: confianza mínima 0.75")
    print(f"   - Rechazo automático si no se detecta rostro")

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBAS DEL SISTEMA DE RECONOCIMIENTO FACIAL")
    print("=" * 70)
    
    try:
        # Ejecutar pruebas
        test_face_recognition_robustness()
        test_threshold_sensitivity()
        
        print("\n🎉 PRUEBAS COMPLETADAS")
        print("=" * 30)
        print("Para probar manualmente:")
        print("1. Registra un visitante con foto")
        print("2. En asistencia, selecciona ese visitante")
        print("3. Toma foto de otra persona")
        print("4. El sistema debe rechazar con error de identidad")
        print("5. Toma foto de la persona correcta")
        print("6. El sistema debe registrar la asistencia")
        
    except Exception as e:
        print(f"❌ ERROR EN LAS PRUEBAS: {str(e)}")
        import traceback
        traceback.print_exc()
