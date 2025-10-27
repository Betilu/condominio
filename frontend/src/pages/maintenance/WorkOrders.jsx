import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Wrench, 
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { maintenanceService, userService } from '../../api/servicesWithToast';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_type: 'corrective',
    asset: '',
    assigned_to: '',
    priority: 'medium',
    status: 'open',
    location: 'Lobby Principal',
    scheduled_date: '',
    estimated_hours: '',
    actual_hours: '',
    notes: ''
  });

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'green' },
    { value: 'medium', label: 'Media', color: 'yellow' },
    { value: 'high', label: 'Alta', color: 'orange' },
    { value: 'urgent', label: 'Urgente', color: 'red' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Abierta', color: 'yellow' },
    { value: 'assigned', label: 'Asignada', color: 'blue' },
    { value: 'in_progress', label: 'En Progreso', color: 'blue' },
    { value: 'pending_parts', label: 'Pendiente Repuestos', color: 'orange' },
    { value: 'pending_approval', label: 'Pendiente Aprobación', color: 'purple' },
    { value: 'completed', label: 'Completada', color: 'green' },
    { value: 'cancelled', label: 'Cancelada', color: 'red' },
    { value: 'closed', label: 'Cerrada', color: 'gray' }
  ];

  const workTypeOptions = [
    { value: 'preventive', label: 'Preventivo' },
    { value: 'corrective', label: 'Correctivo' },
    { value: 'emergency', label: 'Emergencia' },
    { value: 'inspection', label: 'Inspección' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showModal && !editingWorkOrder) {
      // Asegurar que el formulario tenga valores válidos cuando se abre para crear
      setFormData(prev => ({
        ...prev,
        work_type: prev.work_type || 'corrective',
        location: prev.location || 'Lobby Principal'
      }));
    }
  }, [showModal, editingWorkOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workOrdersRes, assetsRes, usersRes] = await Promise.all([
        maintenanceService.getWorkOrders({ page_size: 1000 }),
        maintenanceService.getAssets({ page_size: 1000 }),
        userService.getUsers({ page_size: 1000 })
      ]);

      setWorkOrders(workOrdersRes.data.results || []);
      setAssets(assetsRes.data.results || []);
      setUsers(usersRes.data.results || []);

      console.log('=== WORK ORDERS DATA ===');
      console.log('Work Orders:', workOrdersRes.data.results);
      console.log('Assets:', assetsRes.data.results);
      console.log('Users:', usersRes.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.title.trim()) {
        alert('El título es requerido');
        setLoading(false);
        return;
      }
      if (!formData.work_type) {
        alert('El tipo de trabajo es requerido');
        setLoading(false);
        return;
      }
      if (!formData.location.trim()) {
        alert('La ubicación es requerida');
        setLoading(false);
        return;
      }

      const workOrderData = {
        title: formData.title.trim(),
        description: formData.description || '',
        work_type: formData.work_type,
        asset: formData.asset ? parseInt(formData.asset) : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        priority: formData.priority,
        status: formData.status,
        location: formData.location.trim(),
        scheduled_date: formData.scheduled_date || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        notes: formData.notes || ''
      };

      console.log('=== CREATING/UPDATING WORK ORDER ===');
      console.log('Form data:', formData);
      console.log('Work Order data:', workOrderData);
      console.log('work_type value:', formData.work_type);
      console.log('location value:', formData.location);

      if (editingWorkOrder) {
        await maintenanceService.updateWorkOrder(editingWorkOrder.id, workOrderData);
      } else {
        await maintenanceService.createWorkOrder(workOrderData);
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving work order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workOrder) => {
    console.log('=== EDITING WORK ORDER ===');
    console.log('Work Order:', workOrder);
    
    setEditingWorkOrder(workOrder);
    setFormData({
      title: workOrder.title || '',
      description: workOrder.description || '',
      work_type: workOrder.work_type || 'corrective',
      asset: workOrder.asset ? workOrder.asset.toString() : '',
      assigned_to: workOrder.assigned_to ? workOrder.assigned_to.toString() : '',
      priority: workOrder.priority || 'medium',
      status: workOrder.status || 'open',
      location: workOrder.location || '',
      scheduled_date: workOrder.scheduled_date ? workOrder.scheduled_date.split('T')[0] : '',
      estimated_hours: workOrder.estimated_hours ? workOrder.estimated_hours.toString() : '',
      actual_hours: workOrder.actual_hours ? workOrder.actual_hours.toString() : '',
      notes: workOrder.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden de trabajo?')) {
      try {
        await maintenanceService.deleteWorkOrder(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting work order:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      work_type: 'corrective',
      asset: '',
      assigned_to: '',
      priority: 'medium',
      status: 'open',
      location: 'Lobby Principal',
      scheduled_date: '',
      estimated_hours: '',
      actual_hours: '',
      notes: ''
    });
    setEditingWorkOrder(null);
  };

  const handleNewWorkOrder = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = !searchTerm || 
      workOrder.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || workOrder.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    switch (priorityOption?.color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    switch (statusOption?.color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    urgent: workOrders.filter(wo => wo.priority === 'urgent').length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p className="text-gray-600">Gestiona las órdenes de mantenimiento del condominio</p>
        </div>
        <button
          onClick={handleNewWorkOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar órdenes de trabajo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las prioridades</option>
              {priorityOptions.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredWorkOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de trabajo</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'No se encontraron órdenes con los filtros aplicados'
              : 'Aún no hay órdenes de trabajo registradas'
            }
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Crear Primera Orden
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkOrders.map((workOrder) => (
            <div key={workOrder.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {workOrder.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Wrench className="h-4 w-4 mr-1" />
                      {workOrder.asset_name || 'Sin activo asignado'}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                      {getPriorityIcon(workOrder.priority)}
                      <span className="ml-1 capitalize">{workOrder.priority}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                      {getStatusIcon(workOrder.status)}
                      <span className="ml-1 capitalize">{workOrder.status}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {workOrder.assigned_to_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {workOrder.assigned_to_name}
                    </div>
                  )}
                  {workOrder.scheduled_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(workOrder.scheduled_date).toLocaleDateString()}
                    </div>
                  )}
                  {workOrder.estimated_hours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {workOrder.estimated_hours} horas
                    </div>
                  )}
                  {workOrder.actual_hours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Tiempo real: {workOrder.actual_hours} horas
                    </div>
                  )}
                </div>

                {workOrder.description && (
                  <p className="text-sm text-gray-600 mb-4">{workOrder.description}</p>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(workOrder)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(workOrder.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingWorkOrder ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabajo *</label>
                  <select
                    value={formData.work_type}
                    onChange={(e) => setFormData({...formData, work_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar tipo de trabajo</option>
                    {workTypeOptions.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activo</label>
                  <select
                    value={formData.asset}
                    onChange={(e) => setFormData({...formData, asset: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar activo</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar técnico</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas Reales</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.actual_hours}
                    onChange={(e) => setFormData({...formData, actual_hours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del trabajo a realizar..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales sobre la orden de trabajo..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingWorkOrder ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
