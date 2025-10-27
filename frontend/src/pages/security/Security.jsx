import React, { useState, useEffect } from 'react';
import { securityService, userService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Shield, Camera, Clock, User, MapPin } from 'lucide-react';

const Security = () => {
  const [faces, setFaces] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faces');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    resident: '',
    face_encoding: '',
    is_active: true,
    resident_id: '',
    access_type: 'entry',
    timestamp: '',
    location: '',
    success: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facesRes, accessLogsRes, usersRes] = await Promise.all([
        securityService.getFaces(),
        securityService.getAccessLogs(),
        userService.getUsers({ is_resident: true })
      ]);
      setFaces(facesRes.data.results);
      setAccessLogs(accessLogsRes.data.results);
      setUsers(usersRes.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'faces') {
        if (editingItem) {
          await securityService.updateFace(editingItem.id, formData);
        } else {
          await securityService.createFace(formData);
        }
      } else {
        if (editingItem) {
          await securityService.updateAccessLog(editingItem.id, formData);
        } else {
          await securityService.createAccessLog(formData);
        }
      }
      fetchData();
      setShowModal(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      resident: item.resident || '',
      face_encoding: item.face_encoding || '',
      is_active: item.is_active !== undefined ? item.is_active : true,
      resident_id: item.resident_id || '',
      access_type: item.access_type || 'entry',
      timestamp: item.timestamp || '',
      location: item.location || '',
      success: item.success !== undefined ? item.success : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        if (activeTab === 'faces') {
          await securityService.deleteFace(id);
        } else {
          await securityService.deleteAccessLog(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      resident: '',
      face_encoding: '',
      is_active: true,
      resident_id: '',
      access_type: 'entry',
      timestamp: '',
      location: '',
      success: true
    });
  };

  const getCurrentData = () => {
    return activeTab === 'faces' ? faces : accessLogs;
  };

  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = item.resident?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.resident?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
                         (activeTab === 'faces' ? item.is_active === (statusFilter === 'active') :
                          item.success === (statusFilter === 'success'));
    return matchesSearch && matchesStatus;
  });

  const getAccessTypeColor = (type) => {
    switch (type) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'exit': return 'bg-blue-100 text-blue-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessTypeText = (type) => {
    switch (type) {
      case 'entry': return 'Entrada';
      case 'exit': return 'Salida';
      case 'denied': return 'Denegado';
      default: return type;
    }
  };

  const getSuccessColor = (success) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSuccessText = (success) => {
    return success ? 'Exitoso' : 'Fallido';
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
          <h1 className="text-2xl font-bold text-gray-900">Seguridad y Acceso</h1>
          <p className="text-gray-600">Administra reconocimiento facial y logs de acceso</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo {activeTab === 'faces' ? 'Registro Facial' : 'Log de Acceso'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rostros Registrados</p>
              <p className="text-2xl font-bold text-gray-900">{faces.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accesos Exitosos</p>
              <p className="text-2xl font-bold text-gray-900">
                {accessLogs.filter(log => log.success).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accesos Fallidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {accessLogs.filter(log => !log.success).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Accesos Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {accessLogs.filter(log => {
                  const today = new Date().toDateString();
                  return new Date(log.timestamp).toDateString() === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'faces', name: 'Registro Facial', icon: Camera },
            { id: 'access-logs', name: 'Logs de Acceso', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'faces' ? 'registros faciales' : 'logs de acceso'}...`}
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
              {activeTab === 'faces' ? (
                <>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </>
              ) : (
                <>
                  <option value="success">Exitosos</option>
                  <option value="failed">Fallidos</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  {activeTab === 'faces' ? (
                    <Camera className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeTab === 'faces' ? 
                      (item.resident?.first_name || 'Usuario') : 
                      getAccessTypeText(item.access_type)
                    }
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'faces' ? 
                      item.resident?.username : 
                      new Date(item.timestamp).toLocaleString()
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              {activeTab === 'faces' ? (
                <>
                  <div className="flex justify-between">
                    <span>Residente:</span>
                    <span>{item.resident?.first_name} {item.resident?.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={item.is_active ? 'text-green-600' : 'text-red-600'}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuario:</span>
                    <span>{item.resident?.username}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getAccessTypeColor(item.access_type)}`}>
                      {getAccessTypeText(item.access_type)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resultado:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSuccessColor(item.success)}`}>
                      {getSuccessText(item.success)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ubicación:</span>
                    <span>{item.location || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'faces' ? 'Registro Facial' : 'Log de Acceso'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'faces' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Residente</label>
                      <select
                        value={formData.resident_id}
                        onChange={(e) => setFormData({...formData, resident_id: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar residente</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.username})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Codificación Facial</label>
                      <textarea
                        value={formData.face_encoding}
                        onChange={(e) => setFormData({...formData, face_encoding: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Pegue aquí la codificación facial..."
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Registro activo
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Residente</label>
                      <select
                        value={formData.resident_id}
                        onChange={(e) => setFormData({...formData, resident_id: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar residente</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.username})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Acceso</label>
                        <select
                          value={formData.access_type}
                          onChange={(e) => setFormData({...formData, access_type: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="entry">Entrada</option>
                          <option value="exit">Salida</option>
                          <option value="denied">Denegado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Resultado</label>
                        <select
                          value={formData.success}
                          onChange={(e) => setFormData({...formData, success: e.target.value === 'true'})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="true">Exitoso</option>
                          <option value="false">Fallido</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                      <input
                        type="datetime-local"
                        value={formData.timestamp}
                        onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Entrada principal, Estacionamiento..."
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingItem ? 'Actualizar' : 'Crear'}
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

export default Security;
