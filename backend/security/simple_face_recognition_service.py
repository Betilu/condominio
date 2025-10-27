"""
Servicio simplificado de reconocimiento facial sin dependencias externas problemáticas.
"""
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import cv2
import logging
from .models import Visitor, VisitorFaceEncoding, VisitorAttendance
from django.utils import timezone

logger = logging.getLogger(__name__)

class SimpleFaceRecognitionService:
    """
    Servicio simplificado de reconocimiento facial que usa características básicas de imagen.
    """
    
    def __init__(self):
        self.logger = logger
        # Cargar el clasificador de rostros de OpenCV
        try:
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.logger.info("Clasificador de rostros cargado exitosamente")
        except Exception as e:
            self.logger.error(f"Error cargando clasificador de rostros: {str(e)}")
            self.face_cascade = None
    
    def _image_data_to_numpy(self, image_data):
        """Convierte datos de imagen (base64) a un array NumPy."""
        try:
            if isinstance(image_data, str) and 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]
            
            img_bytes = base64.b64decode(image_data)
            img_buffer = BytesIO(img_bytes)
            img_pil = Image.open(img_buffer)
            img_np = np.array(img_pil)
            
            return img_np
        except Exception as e:
            self.logger.error(f"Error convirtiendo imagen: {str(e)}")
            return None
    
    def _detect_and_extract_face(self, image_np):
        """Detecta y extrae solo la región facial de la imagen."""
        try:
            if self.face_cascade is None:
                self.logger.warning("Clasificador de rostros no disponible, usando imagen completa")
                return image_np
            
            # Convertir a escala de grises para detección
            if len(image_np.shape) == 3:
                gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            else:
                gray = image_np
            
            # Detectar rostros
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                self.logger.warning("No se detectó ningún rostro en la imagen")
                return None
            
            # Tomar el rostro más grande
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = largest_face
            
            # Expandir un poco el área del rostro para incluir más contexto
            padding = 20
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(image_np.shape[1] - x, w + 2 * padding)
            h = min(image_np.shape[0] - y, h + 2 * padding)
            
            # Extraer solo la región del rostro
            face_region = image_np[y:y+h, x:x+w]
            
            self.logger.info(f"Rostro detectado y extraído: {face_region.shape}")
            return face_region
            
        except Exception as e:
            self.logger.error(f"Error detectando rostro: {str(e)}")
            return None
    
    def _extract_basic_features(self, image_np):
        """Extrae características básicas de la imagen."""
        try:
            if len(image_np.shape) == 3:
                height, width, channels = image_np.shape
            else:
                height, width = image_np.shape
                channels = 1
            
            # Características básicas de la imagen
            features = {
                'image_shape': [height, width, channels],
                'aspect_ratio': width / height if height > 0 else 1.0,
                'total_pixels': height * width,
                'brightness': float(np.mean(image_np)),
                'contrast': float(np.std(image_np)),
                'center_region': self._get_center_region_features(image_np),
                'edge_density': self._calculate_edge_density(image_np),
                'color_distribution': self._get_color_distribution(image_np),
                'histogram_features': self._get_histogram_features(image_np)
            }
            
            self.logger.info(f"Características extraídas: {len(features)} elementos")
            return features
        except Exception as e:
            self.logger.error(f"Error extrayendo características: {str(e)}")
            return None
    
    def _get_center_region_features(self, image_np):
        """Obtiene características de la región central de la imagen."""
        try:
            height, width = image_np.shape[:2]
            center_h = height // 2
            center_w = width // 2
            
            # Región central (25% del área total)
            region_size_h = height // 4
            region_size_w = width // 4
            
            start_h = center_h - region_size_h
            end_h = center_h + region_size_h
            start_w = center_w - region_size_w
            end_w = center_w + region_size_w
            
            # Asegurar que los índices estén dentro de los límites
            start_h = max(0, start_h)
            end_h = min(height, end_h)
            start_w = max(0, start_w)
            end_w = min(width, end_w)
            
            center_region = image_np[start_h:end_h, start_w:end_w]
            
            return {
                'mean_brightness': float(np.mean(center_region)),
                'std_brightness': float(np.std(center_region)),
                'region_size': center_region.size
            }
        except Exception as e:
            self.logger.error(f"Error calculando región central: {str(e)}")
            return {'mean_brightness': 0, 'std_brightness': 0, 'region_size': 0}
    
    def _calculate_edge_density(self, image_np):
        """Calcula la densidad de bordes usando diferencias simples."""
        try:
            if len(image_np.shape) == 3:
                gray = np.mean(image_np, axis=2)
            else:
                gray = image_np
            
            # Calcular gradientes simples
            grad_x = np.abs(np.diff(gray, axis=1))
            grad_y = np.abs(np.diff(gray, axis=0))
            
            edge_density = (np.mean(grad_x) + np.mean(grad_y)) / 2
            return float(edge_density)
        except Exception as e:
            self.logger.error(f"Error calculando densidad de bordes: {str(e)}")
            return 0.0
    
    def _get_color_distribution(self, image_np):
        """Obtiene la distribución de colores de la imagen."""
        try:
            if len(image_np.shape) == 3:
                # Imagen a color
                r_mean = float(np.mean(image_np[:, :, 0]))
                g_mean = float(np.mean(image_np[:, :, 1]))
                b_mean = float(np.mean(image_np[:, :, 2]))
                
                return {
                    'r_mean': r_mean,
                    'g_mean': g_mean,
                    'b_mean': b_mean,
                    'dominant_color': 'r' if r_mean > g_mean and r_mean > b_mean else 'g' if g_mean > b_mean else 'b'
                }
            else:
                # Imagen en escala de grises
                return {
                    'r_mean': float(np.mean(image_np)),
                    'g_mean': float(np.mean(image_np)),
                    'b_mean': float(np.mean(image_np)),
                    'dominant_color': 'gray'
                }
        except Exception as e:
            self.logger.error(f"Error calculando distribución de colores: {str(e)}")
            return {'r_mean': 0, 'g_mean': 0, 'b_mean': 0, 'dominant_color': 'unknown'}
    
    def _get_histogram_features(self, image_np):
        """Obtiene características del histograma de la imagen."""
        try:
            if len(image_np.shape) == 3:
                # Convertir a escala de grises para histograma
                gray = np.mean(image_np, axis=2)
            else:
                gray = image_np
            
            # Calcular histograma
            hist, bins = np.histogram(gray.flatten(), bins=32, range=(0, 256))
            
            # Normalizar histograma
            hist = hist / np.sum(hist)
            
            # Características del histograma
            return {
                'histogram_mean': float(np.mean(hist)),
                'histogram_std': float(np.std(hist)),
                'histogram_skewness': float(self._calculate_skewness(hist)),
                'histogram_entropy': float(self._calculate_entropy(hist))
            }
        except Exception as e:
            self.logger.error(f"Error calculando características de histograma: {str(e)}")
            return {'histogram_mean': 0, 'histogram_std': 0, 'histogram_skewness': 0, 'histogram_entropy': 0}
    
    def _calculate_skewness(self, data):
        """Calcula la asimetría de los datos."""
        try:
            mean = np.mean(data)
            std = np.std(data)
            if std == 0:
                return 0
            return np.mean(((data - mean) / std) ** 3)
        except:
            return 0
    
    def _calculate_entropy(self, data):
        """Calcula la entropía de los datos."""
        try:
            # Evitar log(0)
            data = data[data > 0]
            if len(data) == 0:
                return 0
            return -np.sum(data * np.log2(data))
        except:
            return 0
    
    def extract_face_encoding(self, image_data):
        """Extrae codificación facial SOLO del rostro detectado."""
        try:
            self.logger.info("Iniciando extracción de codificación facial...")
            image_np = self._image_data_to_numpy(image_data)
            if image_np is None:
                self.logger.error("No se pudo procesar la imagen")
                return None
            
            self.logger.info(f"Imagen procesada: {image_np.shape}")
            
            # PASO CRÍTICO: Detectar y extraer SOLO el rostro
            self.logger.info("Detectando rostro en la imagen...")
            face_region = self._detect_and_extract_face(image_np)
            
            if face_region is None:
                self.logger.error("No se pudo detectar ningún rostro en la imagen")
                return None
            
            self.logger.info(f"Rostro extraído: {face_region.shape}")
            
            # Extraer características SOLO del rostro (sin ambiente/fondo)
            features = self._extract_basic_features(face_region)
            if features is None:
                self.logger.error("No se pudieron extraer características del rostro")
                return None
            
            # Agregar metadatos específicos del rostro
            features['timestamp'] = timezone.now().isoformat()
            features['encoding_type'] = 'face_only'  # Marcar como solo rostro
            features['face_detected'] = True
            features['original_image_shape'] = image_np.shape
            features['face_region_shape'] = face_region.shape
            
            self.logger.info(f"Codificación facial extraída exitosamente: {len(features)} características")
            self.logger.info(f"Características del rostro: {list(features.keys())}")
            return features
            
        except Exception as e:
            self.logger.error(f"Error extrayendo codificación facial: {str(e)}")
            import traceback
            self.logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def compare_faces(self, encoding1, encoding2, threshold=0.7):
        """
        Compara dos codificaciones faciales SOLO del rostro (sin ambiente).
        """
        try:
            if not encoding1 or not encoding2:
                self.logger.warning("Una o ambas codificaciones están vacías")
                return False, 0.0
            
            # Verificar que ambas codificaciones sean de rostros detectados
            if not encoding1.get('face_detected', False) or not encoding2.get('face_detected', False):
                self.logger.warning("Una o ambas codificaciones no son de rostros detectados")
                return False, 0.0
            
            self.logger.info("Comparando características faciales puras (sin ambiente)...")
            
            # SISTEMA DE VERIFICACIÓN OPTIMIZADO PARA ROSTROS
            similarity_score = 0.0
            total_features = 0
            critical_failures = 0
            minimum_scores = []
            
            # 1. VERIFICACIÓN CRÍTICA: Forma de imagen (peso: 0.25)
            if 'image_shape' in encoding1 and 'image_shape' in encoding2:
                shape1 = encoding1['image_shape']
                shape2 = encoding2['image_shape']
                
                if len(shape1) == len(shape2):
                    shape_diff = sum(abs(a - b) for a, b in zip(shape1, shape2))
                    max_shape = max(sum(shape1), sum(shape2))
                    if max_shape > 0:
                        shape_similarity = max(0, 1 - (shape_diff / max_shape))
                        similarity_score += shape_similarity * 0.25
                        total_features += 0.25
                        minimum_scores.append(shape_similarity)
                        
                        # RECHAZO AUTOMÁTICO si la forma es muy diferente
                        if shape_similarity < 0.6:
                            critical_failures += 1
                            self.logger.error(f"🚫 RECHAZO CRÍTICO: Forma muy diferente - {shape_similarity:.3f}")
                        else:
                            self.logger.info(f"✅ Similitud forma: {shape_similarity:.3f}")
            
            # 2. VERIFICACIÓN CRÍTICA: Relación de aspecto (peso: 0.2)
            if 'aspect_ratio' in encoding1 and 'aspect_ratio' in encoding2:
                ratio_diff = abs(encoding1['aspect_ratio'] - encoding2['aspect_ratio'])
                ratio_similarity = max(0, 1 - (ratio_diff * 3))  # 3x más estricto
                similarity_score += ratio_similarity * 0.2
                total_features += 0.2
                minimum_scores.append(ratio_similarity)
                
                # RECHAZO AUTOMÁTICO si el aspecto es muy diferente
                if ratio_similarity < 0.7:
                    critical_failures += 1
                    self.logger.error(f"🚫 RECHAZO CRÍTICO: Aspecto muy diferente - {ratio_similarity:.3f}")
                else:
                    self.logger.info(f"✅ Similitud aspecto: {ratio_similarity:.3f}")
            
            # 3. VERIFICACIÓN CRÍTICA: Brillo (peso: 0.15)
            if 'brightness' in encoding1 and 'brightness' in encoding2:
                brightness_diff = abs(encoding1['brightness'] - encoding2['brightness'])
                max_brightness = max(encoding1['brightness'], encoding2['brightness'])
                if max_brightness > 0:
                    brightness_similarity = max(0, 1 - (brightness_diff / max_brightness))
                    similarity_score += brightness_similarity * 0.15
                    total_features += 0.15
                    minimum_scores.append(brightness_similarity)
                    
                    # RECHAZO AUTOMÁTICO si el brillo es muy diferente
                    if brightness_similarity < 0.5:
                        critical_failures += 1
                        self.logger.error(f"🚫 RECHAZO CRÍTICO: Brillo muy diferente - {brightness_similarity:.3f}")
                    else:
                        self.logger.info(f"✅ Similitud brillo: {brightness_similarity:.3f}")
            
            # 4. VERIFICACIÓN CRÍTICA: Contraste (peso: 0.15)
            if 'contrast' in encoding1 and 'contrast' in encoding2:
                contrast_diff = abs(encoding1['contrast'] - encoding2['contrast'])
                max_contrast = max(encoding1['contrast'], encoding2['contrast'])
                if max_contrast > 0:
                    contrast_similarity = max(0, 1 - (contrast_diff / max_contrast))
                    similarity_score += contrast_similarity * 0.15
                    total_features += 0.15
                    minimum_scores.append(contrast_similarity)
                    
                    # RECHAZO AUTOMÁTICO si el contraste es muy diferente
                    if contrast_similarity < 0.5:
                        critical_failures += 1
                        self.logger.error(f"🚫 RECHAZO CRÍTICO: Contraste muy diferente - {contrast_similarity:.3f}")
                    else:
                        self.logger.info(f"✅ Similitud contraste: {contrast_similarity:.3f}")
            
            # 5. VERIFICACIÓN CRÍTICA: Región central (peso: 0.25)
            if 'center_region' in encoding1 and 'center_region' in encoding2:
                center1 = encoding1['center_region']
                center2 = encoding2['center_region']
                
                if 'mean_brightness' in center1 and 'mean_brightness' in center2:
                    center_diff = abs(center1['mean_brightness'] - center2['mean_brightness'])
                    max_center = max(center1['mean_brightness'], center2['mean_brightness'])
                    if max_center > 0:
                        center_similarity = max(0, 1 - (center_diff / max_center))
                        similarity_score += center_similarity * 0.25
                        total_features += 0.25
                        minimum_scores.append(center_similarity)
                        
                        # RECHAZO AUTOMÁTICO si el centro es muy diferente
                        if center_similarity < 0.6:
                            critical_failures += 1
                            self.logger.error(f"🚫 RECHAZO CRÍTICO: Centro muy diferente - {center_similarity:.3f}")
                        else:
                            self.logger.info(f"✅ Similitud centro: {center_similarity:.3f}")
            
            # Normalizar puntuación
            if total_features > 0:
                final_score = similarity_score / total_features
            else:
                final_score = 0.0
            
            # REGLAS DE RECHAZO ULTRA ESTRICTAS
            
            # 1. RECHAZO AUTOMÁTICO si hay CUALQUIER falla crítica
            if critical_failures > 0:
                self.logger.error(f"🚫 RECHAZO AUTOMÁTICO: {critical_failures} fallas críticas detectadas")
                return False, final_score
            
            # 2. RECHAZO AUTOMÁTICO si la puntuación mínima de cualquier característica es muy baja
            if minimum_scores:
                min_score = min(minimum_scores)
                if min_score < 0.6:
                    self.logger.error(f"🚫 RECHAZO AUTOMÁTICO: Puntuación mínima muy baja - {min_score:.3f}")
                    return False, final_score
            
            # 3. RECHAZO AUTOMÁTICO si la puntuación final es menor al umbral
            is_match = final_score >= threshold
            
            # 4. RECHAZO AUTOMÁTICO si la puntuación es menor a 0.7 (independientemente del umbral)
            if final_score < 0.7:
                is_match = False
                self.logger.error(f"🚫 RECHAZO AUTOMÁTICO: Puntuación insuficiente - {final_score:.3f} < 0.7")
            
            if is_match:
                self.logger.info(f"✅ VERIFICACIÓN EXITOSA: {final_score:.3f} (threshold: {threshold})")
            else:
                self.logger.error(f"🚫 VERIFICACIÓN FALLIDA: {final_score:.3f} (threshold: {threshold})")
            
            return is_match, final_score
            
        except Exception as e:
            self.logger.error(f"Error comparando caras: {str(e)}")
            return False, 0.0
    
    def register_visitor_face(self, visitor, image_data):
        """Registra la codificación facial de un visitante."""
        try:
            face_encoding = self.extract_face_encoding(image_data)
            if not face_encoding:
                self.logger.error("No se pudo extraer codificación facial")
                return False
            
            # Guardar o actualizar codificación
            face_enc, created = VisitorFaceEncoding.objects.get_or_create(
                visitor=visitor,
                defaults={
                    'face_encoding': json.dumps(face_encoding),
                    'confidence_threshold': 0.7  # Umbral optimizado para rostros
                }
            )
            
            if not created:
                face_enc.face_encoding = json.dumps(face_encoding)
                face_enc.save()
            
            self.logger.info(f"Codificación facial registrada para {visitor}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error registrando codificación facial: {str(e)}")
            return False
    
    def recognize_visitor(self, image_data, threshold=0.7):
        """Reconoce un visitante a partir de una imagen."""
        try:
            current_encoding = self.extract_face_encoding(image_data)
            if not current_encoding:
                return None, 0.0
            
            # Buscar visitantes con codificaciones faciales
            face_encodings = VisitorFaceEncoding.objects.all()
            best_match = None
            best_score = 0.0
            
            self.logger.info(f"Comparando con {face_encodings.count()} codificaciones faciales registradas")
            
            for face_enc in face_encodings:
                try:
                    stored_encoding = json.loads(face_enc.face_encoding)
                    is_match, score = self.compare_faces(
                        current_encoding, 
                        stored_encoding, 
                        face_enc.confidence_threshold
                    )
                    
                    self.logger.info(f"Visitante {face_enc.visitor}: score={score:.3f}, threshold={face_enc.confidence_threshold:.3f}, match={is_match}")
                    
                    if is_match and score > best_score:
                        best_match = face_enc.visitor
                        best_score = score
                        self.logger.info(f"Nuevo mejor match: {best_match} con score {best_score:.3f}")
                        
                except Exception as e:
                    self.logger.error(f"Error comparando con visitante {face_enc.visitor.id}: {str(e)}")
                    continue
            
            if best_match and best_score >= threshold:
                self.logger.info(f"Visitante reconocido: {best_match} (confianza: {best_score:.3f})")
                return best_match, best_score
            else:
                self.logger.info(f"No se reconoció ningún visitante (mejor puntuación: {best_score:.3f})")
                return None, 0.0
                
        except Exception as e:
            self.logger.error(f"Error reconociendo visitante: {str(e)}")
            return None, 0.0
    
    def record_attendance(self, visitor, attendance_type, image_data, camera_location="", notes=""):
        """Registra la asistencia de un visitante con verificación de identidad."""
        try:
            # Verificar que el visitante tenga codificación facial
            try:
                face_encoding_obj = VisitorFaceEncoding.objects.get(visitor=visitor)
                threshold = face_encoding_obj.confidence_threshold
                self.logger.info(f"Usando umbral de confianza: {threshold} para {visitor}")
            except VisitorFaceEncoding.DoesNotExist:
                self.logger.error(f"No se encontró codificación facial para {visitor}")
                return None, 0.0
            
            # PASO 1: Extraer codificación facial de la imagen actual
            self.logger.info("PASO 1: Extrayendo codificación facial de la imagen actual...")
            current_encoding = self.extract_face_encoding(image_data)
            if not current_encoding:
                self.logger.error("No se pudo extraer codificación facial de la imagen actual")
                return None, 0.0
            
            # PASO 2: Obtener codificación almacenada del visitante seleccionado
            self.logger.info("PASO 2: Obteniendo codificación almacenada del visitante seleccionado...")
            stored_encoding = json.loads(face_encoding_obj.face_encoding)
            
            # PASO 3: Comparar directamente con la codificación del visitante seleccionado
            self.logger.info("PASO 3: Comparando codificaciones faciales con verificación ULTRA ESTRICTA...")
            is_match, confidence = self.compare_faces(current_encoding, stored_encoding, threshold)
            
            self.logger.info(f"Comparación directa: match={is_match}, confidence={confidence:.3f}, threshold={threshold}")
            
            # VERIFICACIÓN ADICIONAL ULTRA ESTRICTA
            if not is_match:
                self.logger.error(f"🚫 RECHAZO: No se pudo verificar la identidad - confianza {confidence:.3f} < umbral {threshold}")
                return None, 0.0
            
            # VERIFICACIÓN EXTRA: Si la confianza es menor a 0.75, rechazar incluso si pasó el umbral
            if confidence < 0.75:
                self.logger.error(f"🚫 RECHAZO ADICIONAL: Confianza insuficiente - {confidence:.3f} < 0.75")
                return None, 0.0
            
            # PASO 4: Si la comparación es exitosa, crear el registro de asistencia
            self.logger.info("PASO 4: Verificación exitosa, registrando asistencia...")
            attendance = VisitorAttendance.objects.create(
                visitor=visitor,
                attendance_type=attendance_type,
                confidence_score=confidence,
                camera_location=camera_location,
                notes=notes
            )
            
            self.logger.info(f"✅ Asistencia registrada exitosamente: {visitor} - {attendance_type} (confianza: {confidence:.3f})")
            return attendance, confidence
            
        except Exception as e:
            self.logger.error(f"Error registrando asistencia: {str(e)}")
            return None, 0.0
