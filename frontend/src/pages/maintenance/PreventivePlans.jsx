import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { maintenanceService } from '../../api/servicesWithToast';

const PreventivePlans = () => {
  const [plans, setPlans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    asset: '',
    frequency: 'monthly',
    frequency_value: 1,
    estimated_duration: '',
    is_active: true
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'semi_annual', label: 'Semestral' },
    { value: 'annual', label: 'Anual' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Activo', color: 'green' },
    { value: 'inactive', label: 'Inactivo', color: 'gray' },
    { value: 'completed', label: 'Completado', color: 'blue' },
    { value: 'overdue', label: 'Vencido', color: 'red' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, assetsRes] = await Promise.all([
        maintenanceService.getPreventivePlans({ page_size: 1000 }),
        maintenanceService.getAssets({ page_size: 1000 })
      ]);

      setPlans(plansRes.data.results || []);
      setAssets(assetsRes.data.results || []);

      console.log('=== PREVENTIVE PLANS DATA ===');
      console.log('Plans:', plansRes.data.results);
      console.log('Assets:', assetsRes.data.results);
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
      const planData = {
        name: formData.name,
        description: formData.description || '',
        asset: formData.asset ? parseInt(formData.asset) : null,
        frequency: formData.frequency,
        frequency_value: parseInt(formData.frequency_value) || 1,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        is_active: formData.is_active
      };

      console.log('=== CREATING/UPDATING PREVENTIVE PLAN ===');
      console.log('Plan data:', planData);

      if (editingPlan) {
        await maintenanceService.updatePreventivePlan(editingPlan.id, planData);
      } else {
        await maintenanceService.createPreventivePlan(planData);
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving preventive plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    console.log('=== EDITING PREVENTIVE PLAN ===');
    console.log('Plan:', plan);
    
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      asset: plan.asset ? plan.asset.toString() : '',
      frequency: plan.frequency || 'monthly',
      frequency_value: plan.frequency_value ? plan.frequency_value.toString() : '1',
      estimated_duration: plan.estimated_duration ? plan.estimated_duration.toString() : '',
      is_active: plan.is_active !== undefined ? plan.is_active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plan preventivo?')) {
      try {
        await maintenanceService.deletePreventivePlan(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting preventive plan:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      asset: '',
      frequency: 'monthly',
      frequency_value: 1,
      estimated_duration: '',
      is_active: true
    });
    setEditingPlan(null);
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.asset_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && plan.is_active) ||
      (statusFilter === 'inactive' && !plan.is_active);

    const matchesFrequency = frequencyFilter === 'all' || plan.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const getStatusColor = (plan) => {
    if (!plan.is_active) return 'bg-gray-100 text-gray-800';
    if (plan.next_due_date && new Date(plan.next_due_date) < new Date()) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusIcon = (plan) => {
    if (!plan.is_active) return <XCircle className="h-4 w-4" />;
    if (plan.next_due_date && new Date(plan.next_due_date) < new Date()) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusLabel = (plan) => {
    if (!plan.is_active) return 'Inactivo';
    return 'Activo';
  };

  const getFrequencyLabel = (frequency) => {
    const freq = frequencyOptions.find(f => f.value === frequency);
    return freq ? freq.label : frequency;
  };

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.is_active).length,
    inactive: plans.filter(p => !p.is_active).length,
    overdue: plans.filter(p => p.is_active && p.next_due_date && new Date(p.next_due_date) < new Date()).length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes Preventivos</h1>
          <p className="text-gray-600">Gestiona el mantenimiento preventivo de los activos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Planes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
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
                placeholder="Buscar planes preventivos..."
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
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="overdue">Vencidos</option>
            </select>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las frecuencias</option>
              {frequencyOptions.map(frequency => (
                <option key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes preventivos</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || frequencyFilter !== 'all'
              ? 'No se encontraron planes con los filtros aplicados'
              : 'Aún no hay planes preventivos registrados'
            }
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Crear Primer Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Wrench className="h-4 w-4 mr-1" />
                      {plan.asset_name || 'Sin activo asignado'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan)}`}>
                    {getStatusIcon(plan)}
                    <span className="ml-1">{getStatusLabel(plan)}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {getFrequencyLabel(plan.frequency)} - Cada {plan.frequency_value} {plan.frequency_value === 1 ? 'vez' : 'veces'}
                  </div>
                  {plan.estimated_duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Duración: {plan.estimated_duration} minutos
                    </div>
                  )}
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
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
                {editingPlan ? 'Editar Plan Preventivo' : 'Nuevo Plan Preventivo'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {frequencyOptions.map(frequency => (
                      <option key={frequency.value} value={frequency.value}>
                        {frequency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Frecuencia *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.frequency_value}
                    onChange={(e) => setFormData({...formData, frequency_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración Estimada (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({...formData, estimated_duration: e.target.value})}
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
                  placeholder="Descripción del plan preventivo..."
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
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Plan activo
                </label>
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
                  {loading ? 'Guardando...' : (editingPlan ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreventivePlans;