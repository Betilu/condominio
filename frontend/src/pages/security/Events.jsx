import React, { useState, useEffect } from 'react';
import { securityService } from '../../api/servicesWithToast';
import { Plus, Search, Filter, Camera, Clock, User, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [detectionTypeFilter, setDetectionTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    visitor: '',
    authorization: '',
    event_type: 'entry',
    detection_type: 'manual',
    camera_location: '',
    confidence_score: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, visitorsRes, authRes] = await Promise.all([
        securityService.getAccessEvents({ page_size: 1000 }),
        securityService.getVisitors({ page_size: 1000 }),
        securityService.getAccessAuthorizations({ page_size: 1000 })
      ]);
      
      const eventsData = eventsRes.data.results || eventsRes.data;
      const visitorsData = visitorsRes.data.results || visitorsRes.data;
      const authorizationsData = authRes.data.results || authRes.data;
      
      console.log('=== DATOS CARGADOS ===');
      console.log('Eventos:', eventsData);
      console.log('Primer evento:', eventsData[0]);
      console.log('Visitantes:', visitorsData);
      console.log('Autorizaciones:', authorizationsData);
      
      setEvents(eventsData);
      setVisitors(visitorsData);
      setAuthorizations(authorizationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        visitor: parseInt(formData.visitor),
        authorization: formData.authorization ? parseInt(formData.authorization) : null,
        event_type: formData.event_type,
        detection_type: formData.detection_type,
        camera_location: formData.camera_location || '',
        confidence_score: formData.confidence_score ? parseFloat(formData.confidence_score) : null,
        notes: formData.notes || ''
      };

      if (editingEvent) {
        await securityService.updateAccessEvent(editingEvent.id, submitData);
      } else {
        await securityService.createAccessEvent(submitData);
      }
      
      fetchData();
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event) => {
    console.log('=== EDITANDO EVENTO ===');
    console.log('Evento completo:', event);
    console.log('Visitor ID:', event.visitor, 'Tipo:', typeof event.visitor);
    console.log('Authorization ID:', event.authorization, 'Tipo:', typeof event.authorization);
    console.log('Confidence Score:', event.confidence_score);
    
    // Los IDs vienen directamente del serializer, no como objetos anidados
    const visitorId = event.visitor ? event.visitor.toString() : '';
    const authorizationId = event.authorization ? event.authorization.toString() : '';
    
    console.log('Visitor ID convertido:', visitorId);
    console.log('Authorization ID convertido:', authorizationId);
    
    setEditingEvent(event);
    const formDataToSet = {
      visitor: visitorId,
      authorization: authorizationId,
      event_type: event.event_type || 'entry',
      detection_type: event.detection_type || 'manual',
      camera_location: event.camera_location || '',
      confidence_score: event.confidence_score ? event.confidence_score.toString() : '',
      notes: event.notes || ''
    };
    
    console.log('FormData a establecer:', formDataToSet);
    console.log('Visitantes disponibles:', visitors.map(v => ({ id: v.id, name: `${v.first_name} ${v.last_name}` })));
    console.log('Autorizaciones disponibles:', authorizations.map(a => ({ id: a.id, name: `${a.visitor_name} - ${a.unit_code}` })));
    
    setFormData(formDataToSet);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este evento?')) {
      try {
        await securityService.deleteAccessEvent(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      visitor: '',
      authorization: '',
      event_type: 'entry',
      detection_type: 'manual',
      camera_location: '',
      confidence_score: '',
      notes: ''
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.visitor_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.visitor_document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.camera_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType = !eventTypeFilter || event.event_type === eventTypeFilter;
    const matchesDetectionType = !detectionTypeFilter || event.detection_type === detectionTypeFilter;
    
    return matchesSearch && matchesEventType && matchesDetectionType;
  });

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'exit': return 'bg-blue-100 text-blue-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'entry': return 'Entrada';
      case 'exit': return 'Salida';
      case 'denied': return 'Denegado';
      default: return type;
    }
  };

  const getDetectionTypeText = (type) => {
    switch (type) {
      case 'manual': return 'Manual';
      case 'facial': return 'Reconocimiento Facial';
      case 'plate': return 'Reconocimiento de Placa';
      case 'qr': return 'Código QR';
      case 'card': return 'Tarjeta';
      default: return type;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'entry': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'exit': return <XCircle className="h-5 w-5 text-blue-600" />;
      case 'denied': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos de Acceso</h1>
          <p className="text-gray-600">Registra y gestiona eventos de entrada y salida</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entradas</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.event_type === 'entry').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <XCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Salidas</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.event_type === 'exit').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Denegados</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.event_type === 'denied').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="entry">Entrada</option>
              <option value="exit">Salida</option>
              <option value="denied">Denegado</option>
            </select>
          </div>
          <div>
            <select
              value={detectionTypeFilter}
              onChange={(e) => setDetectionTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los métodos</option>
              <option value="manual">Manual</option>
              <option value="facial">Reconocimiento Facial</option>
              <option value="plate">Reconocimiento de Placa</option>
              <option value="qr">Código QR</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {filteredEvents.length} de {events.length} eventos
            </span>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Detección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confianza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.visitor_name} {event.visitor_last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.visitor_document}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getEventIcon(event.event_type)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_type)}`}>
                        {getEventTypeText(event.event_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {getDetectionTypeText(event.detection_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.camera_location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.confidence_score ? `${(event.confidence_score * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visitante *</label>
                  <select
                    value={formData.visitor}
                    onChange={(e) => setFormData({...formData, visitor: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar visitante</option>
                    {visitors.map(visitor => (
                      <option key={visitor.id} value={visitor.id}>
                        {visitor.first_name} {visitor.last_name} - {visitor.document_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Autorización</label>
                  <select
                    value={formData.authorization}
                    onChange={(e) => setFormData({...formData, authorization: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin autorización</option>
                    {authorizations.map(auth => (
                      <option key={auth.id} value={auth.id}>
                        {auth.visitor_name} - {auth.unit_code} - {auth.purpose}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Evento *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="entry">Entrada</option>
                      <option value="exit">Salida</option>
                      <option value="denied">Denegado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Detección *</label>
                    <select
                      value={formData.detection_type}
                      onChange={(e) => setFormData({...formData, detection_type: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="manual">Manual</option>
                      <option value="facial">Reconocimiento Facial</option>
                      <option value="plate">Reconocimiento de Placa</option>
                      <option value="qr">Código QR</option>
                      <option value="card">Tarjeta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación de Cámara</label>
                  <input
                    type="text"
                    value={formData.camera_location}
                    onChange={(e) => setFormData({...formData, camera_location: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Entrada principal, Estacionamiento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Puntuación de Confianza (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.confidence_score}
                    onChange={(e) => setFormData({...formData, confidence_score: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.95"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingEvent ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
