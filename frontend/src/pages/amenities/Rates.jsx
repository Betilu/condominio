import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign, 
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { amenitiesService } from '../../api/servicesWithToast';

const Rates = () => {
  const [rates, setRates] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    amenity: '',
    rate_type: 'hourly',
    amount: '',
    start_time: '',
    end_time: '',
    is_active: true,
    effective_date: ''
  });

  const rateTypes = [
    { value: 'hourly', label: 'Por Hora' },
    { value: 'daily', label: 'Por Día' },
    { value: 'weekly', label: 'Por Semana' },
    { value: 'monthly', label: 'Por Mes' },
    { value: 'fixed', label: 'Tarifa Fija' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratesRes, amenitiesRes] = await Promise.all([
        amenitiesService.getAmenityRates({ page_size: 1000 }),
        amenitiesService.getAmenities({ page_size: 1000 })
      ]);

      setRates(ratesRes.data.results || []);
      setAmenities(amenitiesRes.data.results || []);

      console.log('=== RATES DATA ===');
      console.log('Rates:', ratesRes.data.results);
      console.log('Amenities:', amenitiesRes.data.results);
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
      const rateData = {
        amenity: parseInt(formData.amenity),
        rate_type: formData.rate_type,
        amount: parseFloat(formData.amount) || 0,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        is_active: formData.is_active,
        effective_date: formData.effective_date || new Date().toISOString().split('T')[0]
      };

      console.log('=== CREATING RATE ===');
      console.log('Rate data:', rateData);

      if (editingRate) {
        await amenitiesService.updateAmenityRate(editingRate.id, rateData);
      } else {
        await amenitiesService.createAmenityRate(rateData);
      }

      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate) => {
    console.log('=== EDITING RATE ===');
    console.log('Rate:', rate);
    
    setEditingRate(rate);
    setFormData({
      amenity: rate.amenity ? rate.amenity.toString() : '',
      rate_type: rate.rate_type || 'hourly',
      amount: rate.amount ? rate.amount.toString() : '',
      start_time: rate.start_time || '',
      end_time: rate.end_time || '',
      is_active: rate.is_active !== undefined ? rate.is_active : true,
      effective_date: rate.effective_date ? rate.effective_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarifa?')) {
      try {
        await amenitiesService.deleteAmenityRate(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      amenity: '',
      rate_type: 'hourly',
      amount: '',
      start_time: '',
      end_time: '',
      is_active: true,
      effective_date: ''
    });
    setEditingRate(null);
  };

  const filteredRates = rates.filter(rate => {
    const matchesSearch = !searchTerm || 
      rate.amenity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.rate_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.amount?.toString().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || rate.rate_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getRateTypeLabel = (type) => {
    const rateType = rateTypes.find(rt => rt.value === type);
    return rateType ? rateType.label : type;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = {
    total: rates.length,
    active: rates.filter(r => r.is_active).length,
    inactive: rates.filter(r => !r.is_active).length,
    totalRevenue: rates.reduce((sum, rate) => sum + (rate.amount || 0), 0),
    byType: rateTypes.map(type => ({
      type: type.label,
      count: rates.filter(r => r.rate_type === type.value).length
    }))
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarifas de Amenidades</h1>
          <p className="text-gray-600">Gestiona las tarifas de las amenidades del condominio</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Tarifa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Tarifas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactivas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {stats.byType.map((typeStat, index) => (
            <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{typeStat.type}</p>
              <p className="text-lg font-bold text-gray-900">{typeStat.count}</p>
            </div>
          ))}
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
                placeholder="Buscar tarifas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los tipos</option>
              {rateTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rates Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRates.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tarifas</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || typeFilter !== 'all' 
              ? 'No se encontraron tarifas con los filtros aplicados'
              : 'Aún no hay tarifas registradas'
            }
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Crear Primera Tarifa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRates.map((rate) => (
            <div key={rate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {rate.amenity_name || 'Amenidad'}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {getRateTypeLabel(rate.rate_type)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rate.is_active)}`}>
                    {getStatusIcon(rate.is_active)}
                    <span className="ml-1">{rate.is_active ? 'Activa' : 'Inactiva'}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(rate.amount || 0)}
                    </span>
                  </div>
                  
                  {(rate.start_time || rate.end_time) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {rate.start_time && rate.end_time 
                        ? `${rate.start_time} - ${rate.end_time}`
                        : rate.start_time || rate.end_time
                      }
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {rate.effective_date ? new Date(rate.effective_date).toLocaleDateString() : 'Sin fecha'}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(rate)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rate.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenidad *</label>
                <select
                  value={formData.amenity}
                  onChange={(e) => setFormData({...formData, amenity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar amenidad</option>
                  {amenities.map(amenity => (
                    <option key={amenity.id} value={amenity.id}>
                      {amenity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Tarifa *</label>
                <select
                  value={formData.rate_type}
                  onChange={(e) => setFormData({...formData, rate_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {rateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Inicio</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Fin</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vigencia</label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  Tarifa activa
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
                  {loading ? 'Guardando...' : (editingRate ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rates;