"""
Servicio de reconocimiento facial para visitantes
"""
import json
import base64
import cv2
import numpy as np
import mediapipe as mp
from django.conf import settings
from django.core.files.base import ContentFile
from .models import Visitor, VisitorFaceEncoding, VisitorAttendance
import logging

logger = logging.getLogger(__name__)


class FaceRecognitionService:
    """Servicio para reconocimiento facial de visitantes."""
    
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5
        )
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    def extract_face_encoding(self, image_data):
        """
        Extrae la codificación facial de una imagen.
        
        Args:
            image_data: Datos de imagen (bytes, base64, o ruta de archivo)
            
        Returns:
            dict: Codificación facial o None si no se detecta cara
        """
        try:
            # Convertir imagen a formato OpenCV
            if isinstance(image_data, str):
                # Si es base64
                if image_data.startswith('data:image'):
                    header, encoded = image_data.split(',', 1)
                    image_bytes = base64.b64decode(encoded)
                else:
                    # Si es ruta de archivo
                    image_bytes = open(image_data, 'rb').read()
            else:
                image_bytes = image_data
            
            # Decodificar imagen
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                logger.error("No se pudo decodificar la imagen")
                return None
            
            # Convertir a RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detectar cara
            results = self.face_detection.process(rgb_image)
            
            if not results.detections:
                logger.warning("No se detectó ninguna cara en la imagen, creando codificación básica")
                # Crear una codificación básica incluso sin detección de cara
                return self._create_basic_face_encoding(rgb_image)
            
            # Obtener landmarks faciales
            mesh_results = self.face_mesh.process(rgb_image)
            
            if not mesh_results.multi_face_landmarks:
                logger.warning("No se pudieron obtener landmarks faciales")
                return None
            
            # Extraer características faciales
            face_landmarks = mesh_results.multi_face_landmarks[0]
            
            # Convertir landmarks a lista de coordenadas
            landmarks = []
            for landmark in face_landmarks.landmark:
                landmarks.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z
                })
            
            # Calcular características adicionales
            face_encoding = self._calculate_face_features(landmarks, image.shape)
            
            logger.info(f"Codificación facial extraída exitosamente: {len(landmarks)} landmarks")
            return face_encoding
            
        except Exception as e:
            logger.error(f"Error extrayendo codificación facial: {str(e)}")
            return None
    
    def _calculate_face_features(self, landmarks, image_shape):
        """
        Calcula características faciales adicionales.
        
        Args:
            landmarks: Lista de landmarks faciales
            image_shape: Forma de la imagen (height, width, channels)
            
        Returns:
            dict: Características faciales calculadas
        """
        try:
            # Convertir landmarks a numpy array
            points = np.array([[lm['x'], lm['y']] for lm in landmarks])
            
            # Calcular centroide facial
            centroid = np.mean(points, axis=0)
            
            # Calcular distancia entre ojos
            left_eye = points[33]  # Punto aproximado del ojo izquierdo
            right_eye = points[362]  # Punto aproximado del ojo derecho
            eye_distance = np.linalg.norm(left_eye - right_eye)
            
            # Calcular ángulo de rotación facial
            eye_vector = right_eye - left_eye
            angle = np.arctan2(eye_vector[1], eye_vector[0])
            
            # Calcular área facial aproximada
            face_area = self._calculate_face_area(points)
            
            # Crear codificación facial
            face_encoding = {
                'landmarks': landmarks,
                'centroid': centroid.tolist(),
                'eye_distance': float(eye_distance),
                'rotation_angle': float(angle),
                'face_area': float(face_area),
                'image_shape': image_shape,
                'feature_count': len(landmarks)
            }
            
            return face_encoding
            
        except Exception as e:
            logger.error(f"Error calculando características faciales: {str(e)}")
            return None
    
    def _create_basic_face_encoding(self, rgb_image):
        """Crea una codificación facial básica cuando no se detecta cara."""
        try:
            # Usar características de la imagen completa
            height, width = rgb_image.shape[:2]
            
            # Crear landmarks básicos basados en la imagen completa
            landmarks = []
            for i in range(10):  # 10 puntos básicos
                x = (i % 5) * 0.2 + 0.1  # Distribuir en la imagen
                y = (i // 5) * 0.5 + 0.25
                landmarks.append({
                    'x': x,
                    'y': y,
                    'z': 0.0
                })
            
            # Calcular características básicas
            centroid = [0.5, 0.5]  # Centro de la imagen
            eye_distance = min(width, height) * 0.1  # Distancia estimada
            angle = 0.0  # Sin rotación
            face_area = width * height * 0.3  # Área estimada
            
            face_encoding = {
                'landmarks': landmarks,
                'centroid': centroid,
                'eye_distance': float(eye_distance),
                'rotation_angle': float(angle),
                'face_area': float(face_area),
                'image_shape': rgb_image.shape,
                'feature_count': len(landmarks),
                'is_basic': True  # Marcar como codificación básica
            }
            
            logger.info(f"Codificación básica creada con {len(landmarks)} landmarks")
            return face_encoding
            
        except Exception as e:
            logger.error(f"Error creando codificación básica: {str(e)}")
            return None
    
    def _calculate_face_area(self, points):
        """Calcula el área aproximada de la cara."""
        try:
            # Usar el convex hull para calcular el área
            from scipy.spatial import ConvexHull
            hull = ConvexHull(points)
            return hull.volume
        except:
            # Fallback: calcular área usando bounding box
            x_coords = points[:, 0]
            y_coords = points[:, 1]
            width = np.max(x_coords) - np.min(x_coords)
            height = np.max(y_coords) - np.min(y_coords)
            return width * height
    
    def compare_faces(self, encoding1, encoding2, threshold=0.7):
        """
        Compara dos codificaciones faciales.
        
        Args:
            encoding1: Primera codificación facial
            encoding2: Segunda codificación facial
            threshold: Umbral de similitud (0-1)
            
        Returns:
            tuple: (es_similar, puntuacion_confianza)
        """
        try:
            if not encoding1 or not encoding2:
                logger.warning("Una o ambas codificaciones faciales están vacías")
                return False, 0.0
            
            # Verificaciones de seguridad más estrictas
            similarity_score = 0.0
            total_features = 0
            critical_failures = 0
            
            # 1. VERIFICACIÓN CRÍTICA: Distancia entre ojos (peso alto)
            if 'eye_distance' in encoding1 and 'eye_distance' in encoding2:
                eye_dist_diff = abs(encoding1['eye_distance'] - encoding2['eye_distance'])
                max_eye_dist = max(encoding1['eye_distance'], encoding2['eye_distance'])
                if max_eye_dist > 0:
                    eye_similarity = max(0, 1 - (eye_dist_diff / max_eye_dist))
                    similarity_score += eye_similarity * 0.25
                    total_features += 0.25
                    
                    if eye_similarity < 0.4:
                        critical_failures += 1
                        logger.warning(f"FALLA CRÍTICA: Distancia entre ojos muy diferente - {eye_similarity:.3f}")
                    else:
                        logger.info(f"Similitud ojos: {eye_similarity:.3f}")
            
            # 2. VERIFICACIÓN CRÍTICA: Ángulo de rotación (peso medio)
            if 'rotation_angle' in encoding1 and 'rotation_angle' in encoding2:
                angle_diff = abs(encoding1['rotation_angle'] - encoding2['rotation_angle'])
                angle_similarity = max(0, 1 - (angle_diff / np.pi))
                similarity_score += angle_similarity * 0.15
                total_features += 0.15
                
                if angle_similarity < 0.3:
                    critical_failures += 1
                    logger.warning(f"FALLA CRÍTICA: Ángulo muy diferente - {angle_similarity:.3f}")
                else:
                    logger.info(f"Similitud ángulo: {angle_similarity:.3f}")
            
            # 3. VERIFICACIÓN CRÍTICA: Área facial (peso medio)
            if 'face_area' in encoding1 and 'face_area' in encoding2:
                area_diff = abs(encoding1['face_area'] - encoding2['face_area'])
                max_area = max(encoding1['face_area'], encoding2['face_area'])
                if max_area > 0:
                    area_similarity = max(0, 1 - (area_diff / max_area))
                    similarity_score += area_similarity * 0.15
                    total_features += 0.15
                    
                    if area_similarity < 0.3:
                        critical_failures += 1
                        logger.warning(f"FALLA CRÍTICA: Área facial muy diferente - {area_similarity:.3f}")
                    else:
                        logger.info(f"Similitud área: {area_similarity:.3f}")
            
            # 4. VERIFICACIÓN CRÍTICA: Landmarks (peso muy alto)
            if 'landmarks' in encoding1 and 'landmarks' in encoding2:
                landmarks_similarity = self._compare_landmarks(
                    encoding1['landmarks'], 
                    encoding2['landmarks']
                )
                similarity_score += landmarks_similarity * 0.45
                total_features += 0.45
                
                if landmarks_similarity < 0.5:
                    critical_failures += 1
                    logger.warning(f"FALLA CRÍTICA: Landmarks muy diferentes - {landmarks_similarity:.3f}")
                else:
                    logger.info(f"Similitud landmarks: {landmarks_similarity:.3f}")
            
            # NO aplicar bonus para codificaciones básicas - ser más estricto
            # Eliminar los bonus que hacían el sistema más permisivo
            
            # Normalizar puntuación
            if total_features > 0:
                final_score = similarity_score / total_features
            else:
                final_score = 0.0
            
            # REGLAS DE RECHAZO ESTRICTAS
            # 1. Si hay más de 1 falla crítica, rechazar automáticamente
            if critical_failures >= 1:
                logger.error(f"RECHAZADO: {critical_failures} fallas críticas detectadas")
                return False, final_score
            
            # 2. Si la puntuación final es menor al umbral, rechazar
            is_match = final_score >= threshold
            
            # 3. Si la puntuación es muy baja (menos de 0.6), rechazar independientemente del umbral
            if final_score < 0.6:
                is_match = False
                logger.warning(f"RECHAZADO: Puntuación muy baja - {final_score:.3f}")
            
            logger.info(f"Comparación facial final: {final_score:.3f} (threshold: {threshold}) - Match: {is_match}")
            return is_match, final_score
            
        except Exception as e:
            logger.error(f"Error comparando caras: {str(e)}")
            return False, 0.0
    
    def _compare_landmarks(self, landmarks1, landmarks2):
        """Compara landmarks faciales."""
        try:
            if len(landmarks1) != len(landmarks2):
                logger.warning(f"Landmarks de diferente longitud: {len(landmarks1)} vs {len(landmarks2)}")
                return 0.0
            
            if len(landmarks1) == 0:
                logger.warning("Landmarks vacíos")
                return 0.0
            
            # Calcular distancia euclidiana promedio
            distances = []
            for i in range(min(len(landmarks1), len(landmarks2))):
                p1 = np.array([landmarks1[i]['x'], landmarks1[i]['y']])
                p2 = np.array([landmarks2[i]['x'], landmarks2[i]['y']])
                distance = np.linalg.norm(p1 - p2)
                distances.append(distance)
            
            # Convertir distancias a similitud con umbral más estricto
            avg_distance = np.mean(distances)
            # Usar umbral más estricto para landmarks (0.05 en lugar de 0.1)
            similarity = max(0, 1 - (avg_distance / 0.05))
            
            logger.info(f"Landmarks - Distancia promedio: {avg_distance:.4f}, Similitud: {similarity:.3f}")
            return similarity
            
        except Exception as e:
            logger.error(f"Error comparando landmarks: {str(e)}")
            return 0.0
    
    def recognize_visitor(self, image_data, threshold=0.7):
        """
        Reconoce un visitante a partir de una imagen.
        
        Args:
            image_data: Datos de imagen
            threshold: Umbral de confianza
            
        Returns:
            tuple: (visitor, confidence_score) o (None, 0.0)
        """
        try:
            # Extraer codificación de la imagen
            face_encoding = self.extract_face_encoding(image_data)
            if not face_encoding:
                return None, 0.0
            
            # Buscar visitantes con codificaciones faciales
            face_encodings = VisitorFaceEncoding.objects.all()
            best_match = None
            best_score = 0.0
            
            logger.info(f"Comparando con {face_encodings.count()} codificaciones faciales registradas")
            
            for face_enc in face_encodings:
                try:
                    stored_encoding = json.loads(face_enc.face_encoding)
                    is_match, score = self.compare_faces(
                        face_encoding, 
                        stored_encoding, 
                        face_enc.confidence_threshold
                    )
                    
                    logger.info(f"Visitante {face_enc.visitor}: score={score:.3f}, threshold={face_enc.confidence_threshold:.3f}, match={is_match}")
                    
                    if is_match and score > best_score:
                        best_match = face_enc.visitor
                        best_score = score
                        logger.info(f"Nuevo mejor match: {best_match} con score {best_score:.3f}")
                        
                except Exception as e:
                    logger.error(f"Error comparando con visitante {face_enc.visitor.id}: {str(e)}")
                    continue
            
            if best_match and best_score >= threshold:
                logger.info(f"Visitante reconocido: {best_match} (confianza: {best_score:.3f})")
                return best_match, best_score
            else:
                logger.info(f"No se reconoció ningún visitante (mejor puntuación: {best_score:.3f})")
                return None, 0.0
                
        except Exception as e:
            logger.error(f"Error reconociendo visitante: {str(e)}")
            return None, 0.0
    
    def register_visitor_face(self, visitor, image_data):
        """
        Registra la codificación facial de un visitante.
        
        Args:
            visitor: Instancia del visitante
            image_data: Datos de imagen
            
        Returns:
            bool: True si se registró exitosamente
        """
        try:
            # Extraer codificación facial
            face_encoding = self.extract_face_encoding(image_data)
            if not face_encoding:
                logger.error("No se pudo extraer codificación facial")
                return False
            
            # Guardar o actualizar codificación
            face_enc, created = VisitorFaceEncoding.objects.get_or_create(
                visitor=visitor,
                defaults={
                    'face_encoding': json.dumps(face_encoding),
                    'confidence_threshold': 0.7  # Umbral estricto para seguridad
                }
            )
            
            if not created:
                face_enc.face_encoding = json.dumps(face_encoding)
                face_enc.save()
            
            logger.info(f"Codificación facial registrada para {visitor}")
            return True
            
        except Exception as e:
            logger.error(f"Error registrando codificación facial: {str(e)}")
            return False
    
    def record_attendance(self, visitor, attendance_type, image_data, camera_location="", notes=""):
        """
        Registra la asistencia de un visitante con verificación de identidad.
        
        Args:
            visitor: Instancia del visitante
            attendance_type: 'entry' o 'exit'
            image_data: Datos de imagen
            camera_location: Ubicación de la cámara
            notes: Notas adicionales
            
        Returns:
            tuple: (attendance, confidence_score)
        """
        try:
            # Verificar que el visitante tenga codificación facial
            try:
                face_encoding_obj = VisitorFaceEncoding.objects.get(visitor=visitor)
                threshold = face_encoding_obj.confidence_threshold
                logger.info(f"Usando umbral de confianza: {threshold} para {visitor}")
            except VisitorFaceEncoding.DoesNotExist:
                logger.error(f"No se encontró codificación facial para {visitor}")
                return None, 0.0
            
            # PASO 1: Reconocer quién está en la imagen actual
            logger.info("PASO 1: Reconociendo visitante en la imagen...")
            recognized_visitor, recognition_confidence = self.recognize_visitor(image_data, threshold)
            
            if not recognized_visitor:
                logger.warning("No se pudo reconocer a ningún visitante en la imagen")
                return None, 0.0
            
            # PASO 2: Verificar que el visitante reconocido coincida con el seleccionado
            logger.info(f"PASO 2: Verificando identidad - Reconocido: {recognized_visitor.id}, Seleccionado: {visitor.id}")
            
            if recognized_visitor.id != visitor.id:
                logger.error(f"ERROR DE IDENTIDAD: La persona en la imagen es {recognized_visitor.get_full_name()} (ID: {recognized_visitor.id}), pero se seleccionó {visitor.get_full_name()} (ID: {visitor.id})")
                return None, 0.0
            
            # PASO 3: Verificación adicional - comparar directamente con la codificación del visitante seleccionado
            logger.info("PASO 3: Verificación adicional con codificación del visitante seleccionado...")
            current_encoding = self.extract_face_encoding(image_data)
            if not current_encoding:
                logger.error("No se pudo extraer codificación facial de la imagen actual")
                return None, 0.0
            
            stored_encoding = json.loads(face_encoding_obj.face_encoding)
            is_match, confidence = self.compare_faces(current_encoding, stored_encoding, threshold)
            
            logger.info(f"Verificación adicional: match={is_match}, confidence={confidence:.3f}, threshold={threshold}")
            
            if not is_match:
                logger.warning(f"Verificación adicional falló: confianza {confidence:.3f} < umbral {threshold}")
                return None, 0.0
            
            # PASO 4: Si todo está correcto, crear el registro de asistencia
            logger.info("PASO 4: Todas las verificaciones pasaron, registrando asistencia...")
            attendance = VisitorAttendance.objects.create(
                visitor=visitor,
                attendance_type=attendance_type,
                confidence_score=confidence,
                camera_location=camera_location,
                notes=notes
            )
            
            logger.info(f"✅ Asistencia registrada exitosamente: {visitor} - {attendance_type} (confianza: {confidence:.3f})")
            return attendance, confidence
            
        except Exception as e:
            logger.error(f"Error registrando asistencia: {str(e)}")
            return None, 0.0
