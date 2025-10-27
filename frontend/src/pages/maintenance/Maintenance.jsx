import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Wrench, Clock, DollarSign, User, Calendar } from 'lucide-react';

const Maintenance = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work-orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
    estimated_cost: '',
    actual_cost: '',
    work_order: '',
    cost_type: 'labor',
    amount: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    category: 'other',
    services: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workOrdersRes, suppliersRes, costsRes] = await Promise.all([
        maintenanceService.getWorkOrders(),
        maintenanceService.getSuppliers(),
        maintenanceService.getWorkOrderCosts()
      ]);
      setWorkOrders(workOrdersRes.data.results);
      setProviders(suppliersRes.data.results);
      setCosts(costsRes.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'work-orders') {
        // Preparar datos para work order
        const workOrderData = {
          title: formData.title,
          description: formData.description || '',
          work_type: 'corrective', // Valor por defecto
          priority: formData.priority,
          status: formData.status,
          location: 'Lobby Principal', // Valor por defecto
          estimated_hours: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
          actual_hours: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
          notes: ''
        };
        
        if (editingItem) {
          await maintenanceService.updateWorkOrder(editingItem.id, workOrderData);
        } else {
          await maintenanceService.createWorkOrder(workOrderData);
        }
      } else if (activeTab === 'providers') {
        // Preparar datos para supplier
        const supplierData = {
          name: formData.name,
          contact_person: formData.contact_person || '',
          phone: formData.phone || '',
          email: formData.email || '',
          address: formData.address || '',
          category: formData.category,
          specialties: formData.description || '',
          services: formData.services || '',
          notes: formData.notes || '',
          rating: 5,
          is_active: true
        };
        
        if (editingItem) {
          await maintenanceService.updateSupplier(editingItem.id, supplierData);
        } else {
          await maintenanceService.createSupplier(supplierData);
        }
      } else {
        // Preparar datos para work order cost
        const costData = {
          work_order: formData.work_order ? parseInt(formData.work_order) : null,
          cost_type: formData.cost_type,
          description: formData.title,
          quantity: 1,
          unit_price: formData.amount ? parseFloat(formData.amount) : 0,
          total_amount: formData.amount ? parseFloat(formData.amount) : 0
        };
        
        if (editingItem) {
          await maintenanceService.updateWorkOrderCost(editingItem.id, costData);
        } else {
          await maintenanceService.createWorkOrderCost(costData);
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
    
    if (activeTab === 'work-orders') {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        priority: item.priority || 'medium',
        status: item.status || 'open',
        assigned_to: item.assigned_to || '',
        estimated_cost: item.estimated_hours || '',
        actual_cost: item.actual_hours || '',
        work_order: '',
        cost_type: 'labor',
        amount: '',
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
      });
    } else if (activeTab === 'providers') {
      setFormData({
        title: item.name || '',
        description: item.specialties || '',
        priority: 'medium',
        status: 'open',
        assigned_to: '',
        estimated_cost: '',
        actual_cost: '',
        work_order: '',
        cost_type: 'labor',
        amount: '',
        name: item.name || '',
        contact_person: item.contact_person || '',
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        category: item.category || 'other',
        services: item.services || '',
        notes: item.notes || ''
      });
    } else if (activeTab === 'costs') {
      setFormData({
        title: item.description || '',
        description: item.description || '',
        priority: 'medium',
        status: 'open',
        assigned_to: '',
        estimated_cost: '',
        actual_cost: '',
        work_order: item.work_order || '',
        cost_type: item.cost_type || 'labor',
        amount: item.total_amount || '',
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        if (activeTab === 'work-orders') {
          await maintenanceService.deleteWorkOrder(id);
        } else if (activeTab === 'providers') {
          await maintenanceService.deleteSupplier(id);
        } else {
          await maintenanceService.deleteWorkOrderCost(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      assigned_to: '',
      estimated_cost: '',
      actual_cost: '',
      work_order: '',
      cost_type: 'labor',
      amount: '',
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      category: 'other',
      services: '',
      notes: ''
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'providers': return providers;
      case 'costs': return costs;
      default: return workOrders;
    }
  };

  const filteredData = getCurrentData().filter(item => {
    let matchesSearch = false;
    
    if (activeTab === 'work-orders') {
      matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (activeTab === 'providers') {
      matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.specialties?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.services?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (activeTab === 'costs') {
      matchesSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.cost_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.work_order_title?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'pending_parts': return 'bg-orange-100 text-orange-800';
      case 'pending_approval': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'open': return 'Abierta';
      case 'assigned': return 'Asignada';
      case 'pending_parts': return 'Pendiente Repuestos';
      case 'pending_approval': return 'Pendiente Aprobación';
      case 'cancelled': return 'Cancelada';
      case 'closed': return 'Cerrada';
      default: return status;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mantenimiento</h1>
          <p className="text-gray-600">Administra órdenes de trabajo, proveedores y costos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo {activeTab === 'work-orders' ? 'Orden' : activeTab === 'providers' ? 'Proveedor' : 'Costo'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'work-orders', name: 'Órdenes de Trabajo', icon: Wrench },
            { id: 'providers', name: 'Proveedores', icon: User },
            { id: 'costs', name: 'Costos', icon: DollarSign }
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
                placeholder={`Buscar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {activeTab === 'work-orders' && (
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="open">Abiertas</option>
                <option value="assigned">Asignadas</option>
                <option value="in_progress">En Progreso</option>
                <option value="pending_parts">Pendiente Repuestos</option>
                <option value="pending_approval">Pendiente Aprobación</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="closed">Cerradas</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  {activeTab === 'work-orders' ? (
                    <Wrench className="h-6 w-6 text-blue-600" />
                  ) : activeTab === 'providers' ? (
                    <User className="h-6 w-6 text-green-600" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeTab === 'work-orders' ? item.title : 
                     activeTab === 'providers' ? item.name : 
                     item.description}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'work-orders' ? `Prioridad: ${getPriorityText(item.priority)}` : 
                     activeTab === 'providers' ? item.contact_person : 
                     `Tipo: ${item.cost_type}`}
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
              <p className="text-gray-900">
                {activeTab === 'work-orders' ? item.description : 
                 activeTab === 'providers' ? item.specialties || 'Sin especialidades' : 
                 item.description}
              </p>
              
              {activeTab === 'work-orders' && (
                <>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prioridad:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                      {getPriorityText(item.priority)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo Estimado:</span>
                    <span>${item.estimated_cost}</span>
                  </div>
                </>
              )}

              {activeTab === 'providers' && (
                <>
                  <div className="flex justify-between">
                    <span>Categoría:</span>
                    <span className="capitalize">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contacto:</span>
                    <span>{item.contact_person}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teléfono:</span>
                    <span>{item.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{item.email}</span>
                  </div>
                  {item.services && (
                    <div className="flex justify-between">
                      <span>Servicios:</span>
                      <span className="text-xs">{item.services.substring(0, 30)}...</span>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'costs' && (
                <>
                  <div className="flex justify-between">
                    <span>Monto:</span>
                    <span className="font-medium">${item.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span>{item.cost_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orden:</span>
                    <span>{item.work_order_title || 'Sin orden'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cantidad:</span>
                    <span>{item.quantity}</span>
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
                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'work-orders' ? 'Orden de Trabajo' : activeTab === 'providers' ? 'Proveedor' : 'Costo'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {activeTab === 'work-orders' ? 'Título' : activeTab === 'providers' ? 'Nombre' : 'Descripción'}
                  </label>
                  <input
                    type="text"
                    value={formData.title || formData.name}
                    onChange={(e) => setFormData({...formData, [activeTab === 'providers' ? 'name' : 'title']: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                {activeTab === 'work-orders' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="open">Abierta</option>
                          <option value="assigned">Asignada</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="pending_parts">Pendiente Repuestos</option>
                          <option value="pending_approval">Pendiente Aprobación</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                          <option value="closed">Cerrada</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Costo Estimado</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.estimated_cost}
                          onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Costo Real</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.actual_cost}
                          onChange={(e) => setFormData({...formData, actual_cost: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'providers' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Persona de Contacto</label>
                      <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoría</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="electrical">Eléctrico</option>
                        <option value="plumbing">Plomería</option>
                        <option value="cleaning">Limpieza</option>
                        <option value="security">Seguridad</option>
                        <option value="maintenance">Mantenimiento</option>
                        <option value="construction">Construcción</option>
                        <option value="landscaping">Jardinería</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Servicios</label>
                      <textarea
                        value={formData.services}
                        onChange={(e) => setFormData({...formData, services: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Lista de servicios que ofrece el proveedor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notas</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Notas adicionales sobre el proveedor"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'costs' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Orden de Trabajo</label>
                      <select
                        value={formData.work_order}
                        onChange={(e) => setFormData({...formData, work_order: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar orden de trabajo</option>
                        {workOrders.map(wo => (
                          <option key={wo.id} value={wo.id}>
                            {wo.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monto</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Costo</label>
                        <select
                          value={formData.cost_type}
                          onChange={(e) => setFormData({...formData, cost_type: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="labor">Mano de Obra</option>
                          <option value="materials">Materiales</option>
                          <option value="parts">Repuestos</option>
                          <option value="transport">Transporte</option>
                          <option value="other">Otros</option>
                        </select>
                      </div>
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

export default Maintenance;
