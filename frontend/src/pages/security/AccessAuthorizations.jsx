import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityService, unitsService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Shield, Calendar, Clock, User, Home, AlertCircle } from 'lucide-react';

const AccessAuthorizations = () => {
  const navigate = useNavigate();
  const [authorizations, setAuthorizations] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAuthorization, setEditingAuthorization] = useState(null);
  const [formData, setFormData] = useState({
    visitor: '',
    unit: '',
    purpose: '',
    start_date: '',
    end_date: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [authRes, visitorsRes, unitsRes] = await Promise.all([
        securityService.getAccessAuthorizations({ page_size: 1000 }),
        securityService.getVisitors({ page_size: 1000 }),
        unitsService.getUnits({ page_size: 1000 })
      ]);
      
      const authorizationsData = authRes.data.results || authRes.data;
      const visitorsData = visitorsRes.data.results || visitorsRes.data;
      const unitsData = unitsRes.data.results || unitsRes.data;
      
      console.log('=== DATOS CARGADOS ===');
      console.log('Autorizaciones:', authorizationsData);
      console.log('Primera autorización:', authorizationsData[0]);
      console.log('Visitantes:', visitorsData);
      console.log('Unidades:', unitsData);
      
      setAuthorizations(authorizationsData);
      setVisitors(visitorsData);
      setUnits(unitsData);
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
        unit: parseInt(formData.unit),
        purpose: formData.purpose,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        notes: formData.notes || ''
      };

      if (editingAuthorization) {
        await securityService.updateAccessAuthorization(editingAuthorization.id, submitData);
      } else {
        await securityService.createAccessAuthorization(submitData);
      }
      
      fetchData();
      setShowModal(false);
      setEditingAuthorization(null);
      resetForm();
    } catch (error) {
      console.error('Error saving authorization:', error);
    }
  };

  const handleEdit = (authorization) => {
    console.log('=== EDITANDO AUTORIZACIÓN ===');
    console.log('Autorización completa:', authorization);
    console.log('Visitor ID:', authorization.visitor, 'Tipo:', typeof authorization.visitor);
    console.log('Unit ID:', authorization.unit, 'Tipo:', typeof authorization.unit);
    
    // Los IDs vienen directamente del serializer, no como objetos anidados
    const visitorId = authorization.visitor ? authorization.visitor.toString() : '';
    const unitId = authorization.unit ? authorization.unit.toString() : '';
    
    console.log('Visitor ID convertido:', visitorId);
    console.log('Unit ID convertido:', unitId);
    
    setEditingAuthorization(authorization);
    setFormData({
      visitor: visitorId,
      unit: unitId,
      purpose: authorization.purpose || '',
      start_date: authorization.start_date ? authorization.start_date.split('T')[0] : '',
      end_date: authorization.end_date ? authorization.end_date.split('T')[0] : '',
      status: authorization.status || 'pending',
      notes: authorization.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta autorización?')) {
      try {
        await securityService.deleteAccessAuthorization(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting authorization:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      visitor: '',
      unit: '',
      purpose: '',
      start_date: '',
      end_date: '',
      status: 'pending',
      notes: ''
    });
  };

  const filteredAuthorizations = authorizations.filter(auth => {
    const matchesSearch = auth.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auth.visitor_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auth.visitor_document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auth.unit_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auth.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || auth.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
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
          <h1 className="text-2xl font-bold text-gray-900">Autorizaciones de Acceso</h1>
          <p className="text-gray-600">Gestiona las autorizaciones de acceso de visitantes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Autorización
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
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{authorizations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {authorizations.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {authorizations.filter(a => a.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiradas</p>
              <p className="text-2xl font-bold text-gray-900">
                {authorizations.filter(a => a.status === 'expired' || isExpired(a.end_date)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar autorizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="expired">Expiradas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Authorizations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propósito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuthorizations.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {auth.visitor_name} {auth.visitor_last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {auth.visitor_document}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{auth.unit_code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {auth.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {auth.start_date ? new Date(auth.start_date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {auth.end_date ? new Date(auth.end_date).toLocaleDateString() : 'Sin fecha fin'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auth.status)}`}>
                      {getStatusText(auth.status)}
                    </span>
                    {isExpired(auth.end_date) && auth.status === 'approved' && (
                      <div className="text-xs text-red-600 mt-1">Expirada</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(auth)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(auth.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
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
                {editingAuthorization ? 'Editar Autorización' : 'Nueva Autorización'}
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
                  <label className="block text-sm font-medium text-gray-700">Unidad *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar unidad</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.tower_name} - {unit.block_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Propósito *</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Visita familiar, entrega de paquete, mantenimiento..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                    <option value="expired">Expirada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAuthorization(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    {editingAuthorization ? 'Actualizar' : 'Crear'}
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

export default AccessAuthorizations;
