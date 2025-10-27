import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { amenitiesService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { 
  Waves, 
  Calendar, 
  Users, 
  Clock, 
  Plus,
  Search,
  Filter
} from 'lucide-react';

const AmenitiesDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAmenities: 0,
    activeReservations: 0,
    todayReservations: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { canPerformAction } = usePermissions();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [amenities, reservations] = await Promise.all([
        amenitiesService.getAmenities({ page_size: 1000 }),
        amenitiesService.getAmenityReservations({ page_size: 1000 })
      ]);

      const amenitiesData = amenities.data.results || amenities.data;
      const reservationsData = reservations.data.results || reservations.data;

      const today = new Date().toISOString().split('T')[0];
      const todayReservations = reservationsData.filter(r => 
        r.reservation_date === today
      ).length;

      const activeReservations = reservationsData.filter(r => 
        r.status === 'confirmed' || r.status === 'pending'
      ).length;

      const totalRevenue = reservationsData
        .filter(r => r.is_paid)
        .reduce((sum, r) => sum + parseFloat(r.total_cost || 0), 0);

      setStats({
        totalAmenities: amenitiesData.length,
        activeReservations,
        todayReservations,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching amenities stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Amenidades',
      value: stats.totalAmenities,
      icon: Waves,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Reservas Activas',
      value: stats.activeReservations,
      icon: Calendar,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Reservas Hoy',
      value: stats.todayReservations,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: Users,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Amenidades</h1>
          <p className="text-gray-600">Gestión de áreas comunes y reservas</p>
        </div>
        <div className="flex space-x-3">
          <PermissionGate permission="add_amenity">
            <button 
              onClick={() => navigate('/amenities/manage')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Amenidad
            </button>
          </PermissionGate>
          <PermissionGate permission="add_amenityreservation">
            <button 
              onClick={() => navigate('/amenities/reservations')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Reserva
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} p-6 rounded-lg shadow-sm`}>
              <div className="flex items-center">
                <div className={`${card.textColor} p-2 rounded-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PermissionGate permission="view_amenity">
            <button 
              onClick={() => navigate('/amenities/manage')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Waves className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Amenidades</h4>
              <p className="text-sm text-gray-500">Gestionar áreas comunes</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_amenityreservation">
            <button 
              onClick={() => navigate('/amenities/reservations')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Reservas</h4>
              <p className="text-sm text-gray-500">Gestionar reservas de amenidades</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_amenityschedule">
            <button 
              onClick={() => navigate('/amenities/schedules')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Clock className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Horarios</h4>
              <p className="text-sm text-gray-500">Configurar horarios de amenidades</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_amenityrate">
            <button 
              onClick={() => navigate('/amenities/rates')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <h4 className="font-medium text-gray-900">Tarifas</h4>
              <p className="text-sm text-gray-500">Gestionar tarifas de reservas</p>
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesDashboard;
