#!/usr/bin/env python
import os
import sys
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from security.models import VisitorAttendance, VisitorFaceEncoding

print(f"Asistencias registradas: {VisitorAttendance.objects.count()}")
for a in VisitorAttendance.objects.all():
    print(f"- {a.visitor.first_name} {a.visitor.last_name} - {a.attendance_type} (confianza: {a.confidence_score:.3f})")

print(f"\nCodificaciones faciales: {VisitorFaceEncoding.objects.count()}")
for f in VisitorFaceEncoding.objects.all():
    print(f"- {f.visitor.first_name} {f.visitor.last_name} (threshold: {f.confidence_threshold})")
