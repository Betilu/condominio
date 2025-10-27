#!/usr/bin/env python
"""
Script para actualizar el umbral de confianza de visitantes existentes
"""
import os
import sys
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import VisitorFaceEncoding

# Actualizar umbral de confianza para todos los visitantes
face_encodings = VisitorFaceEncoding.objects.all()
print(f"Actualizando umbral para {face_encodings.count()} visitantes...")

for face_enc in face_encodings:
    old_threshold = face_enc.confidence_threshold
    face_enc.confidence_threshold = 0.2  # Umbral muy sensible
    face_enc.save()
    print(f"- {face_enc.visitor.first_name} {face_enc.visitor.last_name}: {old_threshold} -> {face_enc.confidence_threshold}")

print("✅ Umbrales actualizados")
