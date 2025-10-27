import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FaceRecognitionCamera from '../../components/FaceRecognitionCamera';
import { securityService } from '../../api/services';

const Attendance = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceType, setAttendanceType] = useState('entry');
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraLocation, setCameraLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchVisitors();
    fetchAttendanceRecords();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await securityService.getVisitors();
      setVisitors(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast.error('Error cargando visitantes');
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await securityService.getAttendance();
      setAttendanceRecords(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Error cargando registros de asistencia');
    }
  };

  const handleStartRecognition = (type) => {
    setAttendanceType(type);
    setShowCamera(true);
  };

  const handlePhotoCapture = async (imageData) => {
    if (!selectedVisitor) {
      toast.error('Seleccione un visitante primero');
      return;
    }

    setLoading(true);
    try {
      const response = await securityService.recordAttendance({
        visitor_id: selectedVisitor.id,
        attendance_type: attendanceType,
        image_data: imageData,
        camera_location: cameraLocation,
        notes: notes
      });

      if (response.data) {
        toast.success(`✅ Asistencia registrada: ${response.data.attendance.visitor}`);
        setSelectedVisitor(null);
        setCameraLocation('');
        setNotes('');
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
      const errorMessage = error.response?.data?.error || 'Error registrando asistencia';
      
      // Mostrar mensajes más específicos según el tipo de error
      if (errorMessage.includes('ERROR DE IDENTIDAD') || errorMessage.includes('identidad')) {
        toast.error('🚫 Error de identidad: La persona en la foto no coincide con el visitante seleccionado');
      } else if (errorMessage.includes('No se pudo reconocer') || errorMessage.includes('verificar la identidad')) {
        toast.error('🚫 Verificación fallida: La persona en la foto no es el visitante seleccionado');
      } else if (errorMessage.includes('codificación facial')) {
        toast.error('🚫 El visitante no tiene codificación facial registrada');
      } else if (errorMessage.includes('Confianza insuficiente') || errorMessage.includes('RECHAZO')) {
        toast.error('🚫 Verificación de seguridad fallida: La persona no coincide con el visitante registrado');
      } else {
        toast.error(`🚫 ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFace = async (visitorId, imageData) => {
    setLoading(true);
    try {
      const response = await securityService.registerFace({
        visitor_id: visitorId,
        image_data: imageData
      });

      if (response.data) {
        toast.success('Codificación facial registrada exitosamente');
        fetchVisitors();
      }
    } catch (error) {
      console.error('Error registering face:', error);
      toast.error(error.response?.data?.error || 'Error registrando codificación facial');
    } finally {
      setLoading(false);
    }
  };

  const getTodayAttendance = () => {
    const today = new Date().toDateString();
    return attendanceRecords.filter(record => 
      new Date(record.timestamp).toDateString() === today
    );
  };

  const todayRecords = getTodayAttendance();
  const todayEntries = todayRecords.filter(r => r.attendance_type === 'entry').length;
  const todayExits = todayRecords.filter(r => r.attendance_type === 'exit').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registro de Asistencia</h1>
        <p className="text-gray-600">Sistema de reconocimiento facial para entrada y salida de visitantes</p>
      </div>

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Entradas Hoy</h3>
          <p className="text-2xl font-bold text-blue-900">{todayEntries}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Salidas Hoy</h3>
          <p className="text-2xl font-bold text-green-900">{todayExits}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Total Registros</h3>
          <p className="text-2xl font-bold text-purple-900">{todayRecords.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Control */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Control de Asistencia</h2>
          
          {/* Selección de Visitante */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Visitante
            </label>
            <select
              value={selectedVisitor?.id || ''}
              onChange={(e) => {
                const visitor = visitors.find(v => v.id === parseInt(e.target.value));
                setSelectedVisitor(visitor);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un visitante</option>
              {visitors.map(visitor => (
                <option key={visitor.id} value={visitor.id}>
                  {visitor.first_name} {visitor.last_name} - {visitor.document_number}
                </option>
              ))}
            </select>
            
            {/* Información del visitante seleccionado */}
            {selectedVisitor && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  {selectedVisitor.photo_url ? (
                    <img
                      src={selectedVisitor.photo_url}
                      alt={`${selectedVisitor.first_name} ${selectedVisitor.last_name}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-lg">👤</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {selectedVisitor.first_name} {selectedVisitor.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedVisitor.document_number}
                    </p>
                    <div className="flex items-center mt-1">
                      {selectedVisitor.photo_url ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Reconocimiento facial disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Sin reconocimiento facial
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                  <strong>👤 DETECCIÓN DE ROSTROS:</strong> El sistema detectará automáticamente el rostro en la foto y extraerá solo las características faciales (sin ambiente/fondo).
                  <br/><br/>
                  <strong>🔍 PROCESO DE VERIFICACIÓN:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Detecta automáticamente el rostro en la imagen</li>
                    <li>Extrae solo las características faciales (sin ambiente)</li>
                    <li>Compara únicamente las características del rostro</li>
                    <li>Rechaza si no es la persona correcta</li>
                  </ul>
                  <br/>
                  <strong>✅ Solo se registrará asistencia si el rostro detectado corresponde a {selectedVisitor.first_name} {selectedVisitor.last_name}.</strong>
                </div>
              </div>
            )}
          </div>

          {/* Ubicación de Cámara */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación de Cámara
            </label>
            <input
              type="text"
              value={cameraLocation}
              onChange={(e) => setCameraLocation(e.target.value)}
              placeholder="Ej: Entrada Principal, Portería, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="space-y-3">
            <button
              onClick={() => handleStartRecognition('entry')}
              disabled={!selectedVisitor || loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span className="mr-2">📥</span>
              {loading ? 'Verificando...' : 'Registrar Entrada'}
            </button>
            
            <button
              onClick={() => handleStartRecognition('exit')}
              disabled={!selectedVisitor || loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span className="mr-2">📤</span>
              {loading ? 'Verificando...' : 'Registrar Salida'}
            </button>
            
            {loading && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  <span className="text-sm text-yellow-800">
                    🔒 Realizando verificaciones de seguridad...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registros de Asistencia */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Registros de Hoy</h2>
          
          {todayRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros de asistencia para hoy</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{record.visitor_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.attendance_type === 'entry' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.attendance_type === 'entry' ? 'Entrada' : 'Salida'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Confianza: {(record.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cámara de Reconocimiento Facial */}
      <FaceRecognitionCamera
        isOpen={showCamera}
        onCapture={handlePhotoCapture}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
};

export default Attendance;
