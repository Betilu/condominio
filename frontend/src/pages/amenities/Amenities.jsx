import React, { useState, useEffect } from 'react';
import { amenitiesService, unitsService, userService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Calendar, Clock, Users, MapPin } from 'lucide-react';

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [rates, setRates] = useState([]);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('amenities');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    // Amenity fields
    name: '',
    amenity_type: 'other',
    description: '',
    capacity: '',
    location: '',
    is_active: true,
    requires_approval: false,
    advance_booking_days: 7,
    max_booking_hours: 4,
    // Reservation fields
    amenity: '',
    unit: '',
    user: '',
    reservation_date: '',
    start_time: '',
    end_time: '',
    status: 'pending',
    guests_count: 1,
    special_requirements: '',
    notes: '',
    // Schedule fields
    day_of_week: 0,
    schedule_start_time: '',
    schedule_end_time: '',
    schedule_is_active: true,
    // Rate fields
    rate_type: 'hourly',
    amount: '',
    rate_start_time: '',
    rate_end_time: '',
    rate_is_active: true,
    effective_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [amenitiesRes, reservationsRes, schedulesRes, ratesRes, unitsRes, usersRes] = await Promise.all([
        amenitiesService.getAmenities({ page_size: 1000 }),
        amenitiesService.getReservations({ page_size: 1000 }),
        amenitiesService.getAmenitySchedules({ page_size: 1000 }),
        amenitiesService.getAmenityRates({ page_size: 1000 }),
        unitsService.getUnits({ page_size: 1000 }),
        userService.getUsers({ page_size: 1000 })
      ]);
      
      console.log('=== DATOS CARGADOS ===');
      console.log('Amenidades:', amenitiesRes.data);
      console.log('Reservas:', reservationsRes.data);
      console.log('Horarios:', schedulesRes.data);
      console.log('Tarifas:', ratesRes.data);
      console.log('Unidades:', unitsRes.data);
      console.log('Usuarios:', usersRes.data);
      
      const amenitiesData = amenitiesRes.data.results || amenitiesRes.data;
      const reservationsData = reservationsRes.data.results || reservationsRes.data;
      const schedulesData = schedulesRes.data.results || schedulesRes.data;
      const ratesData = ratesRes.data.results || ratesRes.data;
      const unitsData = unitsRes.data.results || unitsRes.data;
      const usersData = usersRes.data.results || usersRes.data;
      
      console.log('=== DATOS PROCESADOS ===');
      console.log('Amenidades procesadas:', amenitiesData);
      console.log('Reservas procesadas:', reservationsData);
      console.log('Horarios procesados:', schedulesData);
      console.log('Tarifas procesadas:', ratesData);
      
      setAmenities(amenitiesData);
      setReservations(reservationsData);
      setSchedules(schedulesData);
      setRates(ratesData);
      setUnits(unitsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('=== ENVIANDO DATOS ===');
      console.log('Active tab:', activeTab);
      console.log('Form data:', formData);
      
      if (activeTab === 'amenities') {
        const amenityData = {
          name: formData.name,
          amenity_type: formData.amenity_type,
          description: formData.description,
          capacity: parseInt(formData.capacity) || 0,
          location: formData.location,
          is_active: formData.is_active,
          requires_approval: formData.requires_approval,
          advance_booking_days: parseInt(formData.advance_booking_days) || 7,
          max_booking_hours: parseInt(formData.max_booking_hours) || 4
        };
        
        console.log('Amenity data to send:', amenityData);
        
        if (editingItem) {
          await amenitiesService.updateAmenity(editingItem.id, amenityData);
        } else {
          await amenitiesService.createAmenity(amenityData);
        }
      } else if (activeTab === 'schedules') {
        const scheduleData = {
          amenity: parseInt(formData.amenity),
          day_of_week: parseInt(formData.day_of_week),
          start_time: formData.schedule_start_time,
          end_time: formData.schedule_end_time,
          is_active: formData.schedule_is_active
        };
        
        console.log('Schedule data to send:', scheduleData);
        
        if (editingItem) {
          await amenitiesService.updateAmenitySchedule(editingItem.id, scheduleData);
        } else {
          await amenitiesService.createAmenitySchedule(scheduleData);
        }
      } else if (activeTab === 'rates') {
        const rateData = {
          amenity: parseInt(formData.amenity),
          rate_type: formData.rate_type,
          amount: parseFloat(formData.amount) || 0,
          start_time: formData.rate_start_time || null,
          end_time: formData.rate_end_time || null,
          is_active: formData.rate_is_active,
          effective_date: formData.effective_date || new Date().toISOString().split('T')[0]
        };
        
        console.log('Rate data to send:', rateData);
        
        if (editingItem) {
          await amenitiesService.updateAmenityRate(editingItem.id, rateData);
        } else {
          await amenitiesService.createAmenityRate(rateData);
        }
      } else {
        const reservationData = {
          amenity: parseInt(formData.amenity),
          unit: parseInt(formData.unit),
          user: parseInt(formData.user),
          reservation_date: formData.reservation_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.status,
          guests_count: parseInt(formData.guests_count) || 1,
          special_requirements: formData.special_requirements || '',
          notes: formData.notes || ''
        };
        
        console.log('Reservation data to send:', reservationData);
        
        if (editingItem) {
          await amenitiesService.updateReservation(editingItem.id, reservationData);
        } else {
          await amenitiesService.createReservation(reservationData);
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
    console.log('=== EDITANDO ELEMENTO ===');
    console.log('Item completo:', item);
    console.log('Active tab:', activeTab);
    
    setEditingItem(item);
    
    if (activeTab === 'amenities') {
      setFormData({
        name: item.name || '',
        amenity_type: item.amenity_type || 'other',
        description: item.description || '',
        capacity: item.capacity ? item.capacity.toString() : '',
        location: item.location || '',
        is_active: item.is_active !== undefined ? item.is_active : true,
        requires_approval: item.requires_approval !== undefined ? item.requires_approval : false,
        advance_booking_days: item.advance_booking_days ? item.advance_booking_days.toString() : '7',
        max_booking_hours: item.max_booking_hours ? item.max_booking_hours.toString() : '4',
        // Reset other fields
        amenity: '',
        unit: '',
        user: '',
        reservation_date: '',
        start_time: '',
        end_time: '',
        status: 'pending',
        guests_count: 1,
        special_requirements: '',
        notes: '',
        day_of_week: 0,
        schedule_start_time: '',
        schedule_end_time: '',
        schedule_is_active: true,
        rate_type: 'hourly',
        amount: '',
        rate_start_time: '',
        rate_end_time: '',
        rate_is_active: true,
        effective_date: ''
      });
    } else if (activeTab === 'schedules') {
      setFormData({
        // Reset amenity fields
        name: '',
        amenity_type: 'other',
        description: '',
        capacity: '',
        location: '',
        is_active: true,
        requires_approval: false,
        advance_booking_days: 7,
        max_booking_hours: 4,
        // Set schedule fields
        amenity: item.amenity ? item.amenity.toString() : '',
        day_of_week: item.day_of_week || 0,
        schedule_start_time: item.start_time || '',
        schedule_end_time: item.end_time || '',
        schedule_is_active: item.is_active !== undefined ? item.is_active : true,
        // Reset other fields
        unit: '',
        user: '',
        reservation_date: '',
        start_time: '',
        end_time: '',
        status: 'pending',
        guests_count: 1,
        special_requirements: '',
        notes: '',
        rate_type: 'hourly',
        amount: '',
        rate_start_time: '',
        rate_end_time: '',
        rate_is_active: true,
        effective_date: ''
      });
    } else if (activeTab === 'rates') {
      setFormData({
        // Reset amenity fields
        name: '',
        amenity_type: 'other',
        description: '',
        capacity: '',
        location: '',
        is_active: true,
        requires_approval: false,
        advance_booking_days: 7,
        max_booking_hours: 4,
        // Set rate fields
        amenity: item.amenity ? item.amenity.toString() : '',
        rate_type: item.rate_type || 'hourly',
        amount: item.amount ? item.amount.toString() : '',
        rate_start_time: item.start_time || '',
        rate_end_time: item.end_time || '',
        rate_is_active: item.is_active !== undefined ? item.is_active : true,
        effective_date: item.effective_date ? item.effective_date.split('T')[0] : '',
        // Reset other fields
        unit: '',
        user: '',
        reservation_date: '',
        start_time: '',
        end_time: '',
        status: 'pending',
        guests_count: 1,
        special_requirements: '',
        notes: '',
        day_of_week: 0,
        schedule_start_time: '',
        schedule_end_time: '',
        schedule_is_active: true
      });
    } else {
      setFormData({
        // Reset amenity fields
        name: '',
        amenity_type: 'other',
        description: '',
        capacity: '',
        location: '',
        is_active: true,
        requires_approval: false,
        advance_booking_days: 7,
        max_booking_hours: 4,
        // Set reservation fields
        amenity: item.amenity ? item.amenity.toString() : '',
        unit: item.unit ? item.unit.toString() : '',
        user: item.user ? item.user.toString() : '',
        reservation_date: item.reservation_date ? item.reservation_date.split('T')[0] : '',
        start_time: item.start_time || '',
        end_time: item.end_time || '',
        status: item.status || 'pending',
        guests_count: item.guests_count ? item.guests_count.toString() : '1',
        special_requirements: item.special_requirements || '',
        notes: item.notes || ''
      });
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        if (activeTab === 'amenities') {
          await amenitiesService.deleteAmenity(id);
        } else if (activeTab === 'schedules') {
          await amenitiesService.deleteAmenitySchedule(id);
        } else if (activeTab === 'rates') {
          await amenitiesService.deleteAmenityRate(id);
        } else {
          await amenitiesService.deleteReservation(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      // Amenity fields
      name: '',
      amenity_type: 'other',
      description: '',
      capacity: '',
      location: '',
      is_active: true,
      requires_approval: false,
      advance_booking_days: 7,
      max_booking_hours: 4,
      // Reservation fields
      amenity: '',
      unit: '',
      user: '',
      reservation_date: '',
      start_time: '',
      end_time: '',
      status: 'pending',
      guests_count: 1,
      special_requirements: '',
      notes: '',
      // Schedule fields
      day_of_week: 0,
      schedule_start_time: '',
      schedule_end_time: '',
      schedule_is_active: true,
      // Rate fields
      rate_type: 'hourly',
      amount: '',
      rate_start_time: '',
      rate_end_time: '',
      rate_is_active: true,
      effective_date: ''
    });
  };

  const getCurrentData = () => {
    let data;
    if (activeTab === 'amenities') {
      data = amenities;
    } else if (activeTab === 'schedules') {
      data = schedules;
    } else if (activeTab === 'rates') {
      data = rates;
    } else {
      data = reservations;
    }
    
    console.log('=== GET CURRENT DATA ===');
    console.log('Active tab:', activeTab);
    console.log('Data:', data);
    console.log('Data length:', data.length);
    return data;
  };

  const filteredData = getCurrentData().filter(item => {
    if (activeTab === 'amenities') {
      return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (activeTab === 'schedules') {
      return item.amenity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.get_day_of_week_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.start_time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.end_time?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (activeTab === 'rates') {
      return item.amenity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.rate_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.amount?.toString().includes(searchTerm.toLowerCase());
    } else {
      const matches = item.amenity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.unit_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.status?.toLowerCase().includes(searchTerm.toLowerCase());
      
      console.log('=== FILTRANDO RESERVA ===');
      console.log('Item:', item);
      console.log('Search term:', searchTerm);
      console.log('Matches:', matches);
      
      return matches;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Amenidades</h1>
          <p className="text-gray-600">Administra amenidades y reservas del condominio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo {activeTab === 'amenities' ? 'Amenidad' : 'Reserva'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'amenities', name: 'Amenidades', icon: MapPin },
            { id: 'schedules', name: 'Horarios', icon: Clock },
            { id: 'rates', name: 'Tarifas', icon: Users },
            { id: 'reservations', name: 'Reservas', icon: Calendar }
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
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'amenities' ? 'amenidades' : 'reservas'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            {activeTab === 'amenities' && `${amenities.length} amenidades`}
            {activeTab === 'schedules' && `${schedules.length} horarios`}
            {activeTab === 'rates' && `${rates.length} tarifas`}
            {activeTab === 'reservations' && `${reservations.length} reservas`}
          </div>
        </div>
      </div>

      {/* Data Grid */}
      {filteredData.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            {activeTab === 'amenities' ? (
              <MapPin className="h-12 w-12 mx-auto" />
            ) : (
              <Calendar className="h-12 w-12 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'amenities' && 'No hay amenidades'}
            {activeTab === 'schedules' && 'No hay horarios'}
            {activeTab === 'rates' && 'No hay tarifas'}
            {activeTab === 'reservations' && 'No hay reservas'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'amenities' && 'Crea tu primera amenidad para comenzar'}
            {activeTab === 'schedules' && 'Crea tu primer horario para comenzar'}
            {activeTab === 'rates' && 'Crea tu primera tarifa para comenzar'}
            {activeTab === 'reservations' && 'Crea tu primera reserva para comenzar'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Crear {activeTab === 'amenities' && 'Amenidad'}
            {activeTab === 'schedules' && 'Horario'}
            {activeTab === 'rates' && 'Tarifa'}
            {activeTab === 'reservations' && 'Reserva'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  {activeTab === 'amenities' ? (
                    <MapPin className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Calendar className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeTab === 'amenities' && item.name}
                    {activeTab === 'schedules' && item.amenity_name}
                    {activeTab === 'rates' && item.amenity_name}
                    {activeTab === 'reservations' && item.amenity_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'amenities' && `Capacidad: ${item.capacity}`}
                    {activeTab === 'schedules' && `${item.get_day_of_week_display} ${item.start_time}-${item.end_time}`}
                    {activeTab === 'rates' && `$${item.amount} - ${item.get_rate_type_display}`}
                    {activeTab === 'reservations' && `Fecha: ${item.reservation_date}`}
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
                {activeTab === 'amenities' && item.description}
                {activeTab === 'schedules' && `${item.start_time} - ${item.end_time}`}
                {activeTab === 'rates' && `Vigente desde: ${item.effective_date}`}
                {activeTab === 'reservations' && `${item.unit_code} - ${item.user_name}`}
              </p>
              
              {activeTab === 'amenities' && (
                <>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span>{item.amenity_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacidad:</span>
                    <span>{item.capacity} personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ubicación:</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={item.is_active ? 'text-green-600' : 'text-red-600'}>
                      {item.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </>
              )}
              
              {activeTab === 'schedules' && (
                <>
                  <div className="flex justify-between">
                    <span>Día:</span>
                    <span>{item.get_day_of_week_display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora inicio:</span>
                    <span>{item.start_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora fin:</span>
                    <span>{item.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={item.is_active ? 'text-green-600' : 'text-red-600'}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </>
              )}
              
              {activeTab === 'rates' && (
                <>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span>{item.get_rate_type_display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto:</span>
                    <span>${item.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vigente desde:</span>
                    <span>{item.effective_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={item.is_active ? 'text-green-600' : 'text-red-600'}>
                      {item.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </>
              )}
              
              {activeTab === 'reservations' && (
                <>
                  <div className="flex justify-between">
                    <span>Hora inicio:</span>
                    <span>{item.start_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora fin:</span>
                    <span>{item.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Huéspedes:</span>
                    <span>{item.guests_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Editar' : 'Nuevo'} {
                  activeTab === 'amenities' && 'Amenidad'
                }{activeTab === 'schedules' && 'Horario'}
                {activeTab === 'rates' && 'Tarifa'}
                {activeTab === 'reservations' && 'Reserva'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {activeTab === 'amenities' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Amenidad *</label>
                    <select
                      value={formData.amenity_type}
                      onChange={(e) => setFormData({...formData, amenity_type: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="pool">Piscina</option>
                      <option value="gym">Gimnasio</option>
                      <option value="party_room">Salón de Fiestas</option>
                      <option value="bbq">Parrillero</option>
                      <option value="playground">Parque Infantil</option>
                      <option value="tennis">Cancha de Tenis</option>
                      <option value="basketball">Cancha de Basketball</option>
                      <option value="meeting_room">Sala de Juntas</option>
                      <option value="library">Biblioteca</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                {activeTab === 'amenities' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ubicación *</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Capacidad *</label>
                        <input
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Días de Anticipación</label>
                        <input
                          type="number"
                          value={formData.advance_booking_days}
                          onChange={(e) => setFormData({...formData, advance_booking_days: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Máximo Horas de Reserva</label>
                        <input
                          type="number"
                          value={formData.max_booking_hours}
                          onChange={(e) => setFormData({...formData, max_booking_hours: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Amenidad activa
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requires_approval"
                          checked={formData.requires_approval}
                          onChange={(e) => setFormData({...formData, requires_approval: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requires_approval" className="ml-2 block text-sm text-gray-900">
                          Requiere aprobación
                        </label>
                      </div>
                    </div>
                  </>
                ) : activeTab === 'schedules' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amenidad *</label>
                      <select
                        value={formData.amenity}
                        onChange={(e) => setFormData({...formData, amenity: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700">Día de la Semana *</label>
                      <select
                        value={formData.day_of_week}
                        onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value={0}>Lunes</option>
                        <option value={1}>Martes</option>
                        <option value={2}>Miércoles</option>
                        <option value={3}>Jueves</option>
                        <option value={4}>Viernes</option>
                        <option value={5}>Sábado</option>
                        <option value={6}>Domingo</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Inicio *</label>
                        <input
                          type="time"
                          value={formData.schedule_start_time}
                          onChange={(e) => setFormData({...formData, schedule_start_time: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Fin *</label>
                        <input
                          type="time"
                          value={formData.schedule_end_time}
                          onChange={(e) => setFormData({...formData, schedule_end_time: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="schedule_is_active"
                        checked={formData.schedule_is_active}
                        onChange={(e) => setFormData({...formData, schedule_is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="schedule_is_active" className="ml-2 block text-sm text-gray-900">
                        Horario activo
                      </label>
                    </div>
                  </>
                ) : activeTab === 'rates' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amenidad *</label>
                      <select
                        value={formData.amenity}
                        onChange={(e) => setFormData({...formData, amenity: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Tarifa *</label>
                        <select
                          value={formData.rate_type}
                          onChange={(e) => setFormData({...formData, rate_type: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="hourly">Por Hora</option>
                          <option value="daily">Por Día</option>
                          <option value="fixed">Tarifa Fija</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monto *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                        <input
                          type="time"
                          value={formData.rate_start_time}
                          onChange={(e) => setFormData({...formData, rate_start_time: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                        <input
                          type="time"
                          value={formData.rate_end_time}
                          onChange={(e) => setFormData({...formData, rate_end_time: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Vigencia *</label>
                      <input
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rate_is_active"
                        checked={formData.rate_is_active}
                        onChange={(e) => setFormData({...formData, rate_is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="rate_is_active" className="ml-2 block text-sm text-gray-900">
                        Tarifa activa
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amenidad *</label>
                        <select
                          value={formData.amenity}
                          onChange={(e) => setFormData({...formData, amenity: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                              {unit.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Usuario *</label>
                      <select
                        value={formData.user}
                        onChange={(e) => setFormData({...formData, user: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar usuario</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Reserva *</label>
                        <input
                          type="date"
                          value={formData.reservation_date}
                          onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="cancelled">Cancelada</option>
                          <option value="completed">Completada</option>
                          <option value="no_show">No Show</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Inicio *</label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Fin *</label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número de Huéspedes</label>
                      <input
                        type="number"
                        value={formData.guests_count}
                        onChange={(e) => setFormData({...formData, guests_count: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requerimientos Especiales</label>
                      <textarea
                        value={formData.special_requirements}
                        onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notas</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
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

export default Amenities;

