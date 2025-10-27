import React, { useState, useEffect } from 'react';
import { unitsService, userService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { Plus, Search, Edit, Trash2, Building, Home, Users, User, Phone, Mail, Key, Shield } from 'lucide-react';

const Units = () => {
  const [units, setUnits] = useState([]);
  const [towers, setTowers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('units');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    block: '',
    category: 'departamento',
    floor: '',
    number: '',
    area: '',
    ownership_coefficient: '',
    bedrooms: 1,
    bathrooms: 1,
    parking_spaces: 0,
    storage_rooms: 0,
    status: 'vacía',
    owner: '',
    tenant: '',
    owner_email: '',
    owner_phone: '',
    owner_whatsapp: '',
    tenant_email: '',
    tenant_phone: '',
    tenant_whatsapp: '',
    owner_notifications: true,
    tenant_notifications: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [unitsRes, towersRes, blocksRes, usersRes] = await Promise.all([
        unitsService.getUnits(),
        unitsService.getTowers(),
        unitsService.getBlocks(),
        userService.getUsers({ page_size: 1000 })
      ]);
      setUnits(unitsRes.data.results);
      setTowers(towersRes.data.results);
      setBlocks(blocksRes.data.results);
      setUsers(usersRes.data.results);
      console.log('Loaded blocks:', blocksRes.data.results);
      console.log('Blocks details:', blocksRes.data.results.map(b => ({ id: b.id, name: b.name, tower: b.tower })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'towers') {
        if (editingItem) {
          await unitsService.updateTower(editingItem.id, formData);
        } else {
          await unitsService.createTower(formData);
        }
      } else if (activeTab === 'blocks') {
        if (editingItem) {
          await unitsService.updateBlock(editingItem.id, formData);
        } else {
          await unitsService.createBlock(formData);
        }
      } else {
        // Validate required fields
        if (!formData.block) {
          alert('Debe seleccionar un bloque');
          return;
        }
        
        if (!formData.code) {
          alert('El código es obligatorio');
          return;
        }
        
        // Validate numeric fields
        if (formData.area && (isNaN(parseFloat(formData.area)) || parseFloat(formData.area) <= 0)) {
          alert('El área debe ser un número mayor a 0');
          return;
        }
        
        if (formData.ownership_coefficient && (isNaN(parseFloat(formData.ownership_coefficient)) || parseFloat(formData.ownership_coefficient) <= 0 || parseFloat(formData.ownership_coefficient) > 1)) {
          alert('El coeficiente de copropiedad debe ser un número entre 0 y 1');
          return;
        }
        
        // Convert and clean data for backend
        console.log('Original formData.block:', formData.block, 'type:', typeof formData.block);
        const blockId = parseInt(formData.block);
        console.log('Converted block ID:', blockId, 'type:', typeof blockId);
        
        const unitData = {
          code: formData.code,
          block: blockId,
          category: formData.category,
          floor: formData.floor ? parseInt(formData.floor) : null,
          number: formData.number || null,
          area: formData.area ? parseFloat(formData.area) : null,
          ownership_coefficient: formData.ownership_coefficient ? parseFloat(formData.ownership_coefficient) : null,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          parking_spaces: parseInt(formData.parking_spaces) || 0,
          storage_rooms: parseInt(formData.storage_rooms) || 0,
          status: formData.status,
          owner: formData.owner ? parseInt(formData.owner) : null,
          tenant: formData.tenant ? parseInt(formData.tenant) : null,
          // Clean empty strings to null for optional fields
          owner_email: formData.owner_email || null,
          owner_phone: formData.owner_phone || null,
          owner_whatsapp: formData.owner_whatsapp || null,
          tenant_email: formData.tenant_email || null,
          tenant_phone: formData.tenant_phone || null,
          tenant_whatsapp: formData.tenant_whatsapp || null,
          owner_notifications: formData.owner_notifications,
          tenant_notifications: formData.tenant_notifications
        };
        console.log('Sending unit data:', unitData);
        if (editingItem) {
          await unitsService.updateUnit(editingItem.id, unitData);
        } else {
          await unitsService.createUnit(unitData);
        }
      }
      fetchData();
      setShowModal(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Errores de validación:\n${errorMessages}`);
        } else {
          alert(`Error: ${errorData}`);
        }
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      block: item.block || '',
      category: item.category || 'departamento',
      floor: item.floor || '',
      number: item.number || '',
      area: item.area || '',
      ownership_coefficient: item.ownership_coefficient || '',
      bedrooms: item.bedrooms || 1,
      bathrooms: item.bathrooms || 1,
      parking_spaces: item.parking_spaces || 0,
      storage_rooms: item.storage_rooms || 0,
      status: item.status || 'vacía',
      owner: item.owner || '',
      tenant: item.tenant || '',
      owner_email: item.owner_email || '',
      owner_phone: item.owner_phone || '',
      owner_whatsapp: item.owner_whatsapp || '',
      tenant_email: item.tenant_email || '',
      tenant_phone: item.tenant_phone || '',
      tenant_whatsapp: item.tenant_whatsapp || '',
      owner_notifications: item.owner_notifications !== undefined ? item.owner_notifications : true,
      tenant_notifications: item.tenant_notifications !== undefined ? item.tenant_notifications : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        if (activeTab === 'towers') {
          await unitsService.deleteTower(id);
        } else if (activeTab === 'blocks') {
          await unitsService.deleteBlock(id);
        } else {
          await unitsService.deleteUnit(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const generateUniqueCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `U-${timestamp}-${random}`.toUpperCase();
  };

  const resetForm = () => {
    setFormData({
      code: generateUniqueCode(),
      block: '',
      category: 'departamento',
      floor: '',
      number: '',
      area: '',
      ownership_coefficient: '',
      bedrooms: 1,
      bathrooms: 1,
      parking_spaces: 0,
      storage_rooms: 0,
      status: 'vacía',
      owner: '',
      tenant: '',
      owner_email: '',
      owner_phone: '',
      owner_whatsapp: '',
      tenant_email: '',
      tenant_phone: '',
      tenant_whatsapp: '',
      owner_notifications: true,
      tenant_notifications: true
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'towers': return towers;
      case 'blocks': return blocks;
      default: return units;
    }
  };

  const filteredData = getCurrentData().filter(item => {
    if (activeTab === 'units') {
      return item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.number?.toString().includes(searchTerm) ||
             item.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.number?.toString().includes(searchTerm);
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Unidades</h1>
          <p className="text-gray-600">Administra torres, bloques y unidades</p>
        </div>
        <PermissionGate 
          permission={activeTab === 'towers' ? 'add_unittower' : activeTab === 'blocks' ? 'add_unitblock' : 'add_unit'}
        >
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo {activeTab === 'towers' ? 'Torre' : activeTab === 'blocks' ? 'Bloque' : 'Unidad'}
          </button>
        </PermissionGate>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'units', name: 'Unidades', icon: Home },
            { id: 'blocks', name: 'Bloques', icon: Building },
            { id: 'towers', name: 'Torres', icon: Building }
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

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  {activeTab === 'towers' ? (
                    <Building className="h-6 w-6 text-blue-600" />
                  ) : activeTab === 'blocks' ? (
                    <Building className="h-6 w-6 text-green-600" />
                  ) : (
                    <Home className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeTab === 'units' ? item.code : item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'units' ? `${item.tower_name} - ${item.block_name}` : `ID: ${item.id}`}
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
            
            {activeTab === 'units' && (
              <div className="space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'ocupada' ? 'bg-green-100 text-green-800' :
                    item.status === 'vacía' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status === 'ocupada' ? 'Ocupada' :
                     item.status === 'vacía' ? 'Vacía' : 'Mantenimiento'}
                  </span>
                </div>

                {/* Physical characteristics */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Área:</span>
                    <span>{item.area ? `${item.area} m²` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coeficiente:</span>
                    <span>{item.ownership_coefficient ? `${item.ownership_coefficient}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Habitaciones:</span>
                    <span>{item.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baños:</span>
                    <span>{item.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estacionamientos:</span>
                    <span>{item.parking_spaces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bodegas:</span>
                    <span>{item.storage_rooms}</span>
                  </div>
                </div>

                {/* Owner info */}
                {item.owner_name && (
                  <div className="border-t pt-3">
                    <div className="flex items-center mb-2">
                      <Key className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Propietario</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{item.owner_name}</div>
                      {item.owner_email && (
                        <div className="flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs">{item.owner_email}</span>
                        </div>
                      )}
                      {item.owner_phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs">{item.owner_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tenant info */}
                {item.tenant_name && (
                  <div className="border-t pt-3">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Inquilino</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{item.tenant_name}</div>
                      {item.tenant_email && (
                        <div className="flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs">{item.tenant_email}</span>
                        </div>
                      )}
                      {item.tenant_phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs">{item.tenant_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'towers' ? 'Torre' : activeTab === 'blocks' ? 'Bloque' : 'Unidad'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'towers' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                {activeTab === 'blocks' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Torre</label>
                      <select
                        value={formData.tower}
                        onChange={(e) => setFormData({...formData, tower: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar torre</option>
                        {towers.map(tower => (
                          <option key={tower.id} value={tower.id}>{tower.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </>
                )}

                {activeTab === 'units' && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Código *</label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bloque *</label>
                        <select
                          value={formData.block}
                          onChange={(e) => setFormData({...formData, block: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar bloque</option>
                          {blocks.map(block => (
                            <option key={block.id} value={block.id}>{block.tower_name} - {block.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="departamento">Departamento</option>
                          <option value="cochera">Cochera</option>
                          <option value="bodega">Bodega</option>
                          <option value="estacionamiento">Estacionamiento</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Piso</label>
                        <input
                          type="number"
                          value={formData.floor}
                          onChange={(e) => setFormData({...formData, floor: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Número</label>
                        <input
                          type="text"
                          value={formData.number}
                          onChange={(e) => setFormData({...formData, number: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Área (m²)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Coeficiente de Copropiedad</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.ownership_coefficient}
                          onChange={(e) => setFormData({...formData, ownership_coefficient: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Habitaciones</label>
                        <input
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Baños</label>
                        <input
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estacionamientos</label>
                        <input
                          type="number"
                          value={formData.parking_spaces}
                          onChange={(e) => setFormData({...formData, parking_spaces: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bodegas</label>
                        <input
                          type="number"
                          value={formData.storage_rooms}
                          onChange={(e) => setFormData({...formData, storage_rooms: e.target.value})}
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
                        <option value="vacía">Vacía</option>
                        <option value="ocupada">Ocupada</option>
                        <option value="mantenimiento">En Mantenimiento</option>
                      </select>
                    </div>

                    {/* Owner Section */}
                    <div className="border-t pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <Key className="h-5 w-5 mr-2 text-blue-600" />
                        Propietario
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Usuario Propietario</label>
                          <select
                            value={formData.owner}
                            onChange={(e) => setFormData({...formData, owner: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Sin propietario</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.username} - {user.first_name} {user.last_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email del Propietario</label>
                          <input
                            type="email"
                            value={formData.owner_email}
                            onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Teléfono del Propietario</label>
                          <input
                            type="tel"
                            value={formData.owner_phone}
                            onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">WhatsApp del Propietario</label>
                          <input
                            type="tel"
                            value={formData.owner_whatsapp}
                            onChange={(e) => setFormData({...formData, owner_whatsapp: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.owner_notifications}
                            onChange={(e) => setFormData({...formData, owner_notifications: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">Propietario recibe notificaciones</span>
                        </label>
                      </div>
                    </div>

                    {/* Tenant Section */}
                    <div className="border-t pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-green-600" />
                        Inquilino
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Usuario Inquilino</label>
                          <select
                            value={formData.tenant}
                            onChange={(e) => setFormData({...formData, tenant: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Sin inquilino</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.username} - {user.first_name} {user.last_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email del Inquilino</label>
                          <input
                            type="email"
                            value={formData.tenant_email}
                            onChange={(e) => setFormData({...formData, tenant_email: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Teléfono del Inquilino</label>
                          <input
                            type="tel"
                            value={formData.tenant_phone}
                            onChange={(e) => setFormData({...formData, tenant_phone: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">WhatsApp del Inquilino</label>
                          <input
                            type="tel"
                            value={formData.tenant_whatsapp}
                            onChange={(e) => setFormData({...formData, tenant_whatsapp: e.target.value})}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.tenant_notifications}
                            onChange={(e) => setFormData({...formData, tenant_notifications: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">Inquilino recibe notificaciones</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
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

export default Units;
