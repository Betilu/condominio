import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Clock, 
  Eye,
  Plus,
  Search,
  Filter,
  Camera,
  UserCheck
} from 'lucide-react';

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeAuthorizations: 0,
    todayEvents: 0,
    pendingIncidents: 0
  });
  const [loading, setLoading] = useState(true);
  const { canPerformAction } = usePermissions();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [visitors, authorizations, events, incidents] = await Promise.all([
        securityService.getVisitors({ page_size: 1000 }),
        securityService.getAccessAuthorizations({ page_size: 1000 }),
        securityService.getAccessEvents({ page_size: 1000 }),
        securityService.getSecurityIncidents({ page_size: 1000 })
      ]);

      const visitorsData = visitors.data.results || visitors.data;
      const authorizationsData = authorizations.data.results || authorizations.data;
      const eventsData = events.data.results || events.data;
      const incidentsData = incidents.data.results || incidents.data;

      const today = new Date().toISOString().split('T')[0];
      const todayEvents = eventsData.filter(e => 
        e.timestamp.startsWith(today)
      ).length;

      const activeAuthorizations = authorizationsData.filter(a => 
        a.status === 'authorized'
      ).length;

      const pendingIncidents = incidentsData.filter(i => 
        i.status === 'reported' || i.status === 'in_progress'
      ).length;

      setStats({
        totalVisitors: visitorsData.length,
        activeAuthorizations,
        todayEvents,
        pendingIncidents
      });
    } catch (error) {
      console.error('Error fetching security stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Visitantes',
      value: stats.totalVisitors,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Autorizaciones Activas',
      value: stats.activeAuthorizations,
      icon: Shield,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Eventos Hoy',
      value: stats.todayEvents,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Incidentes Pendientes',
      value: stats.pendingIncidents,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Seguridad</h1>
          <p className="text-gray-600">Control de acceso y seguridad del condominio</p>
        </div>
        <div className="flex space-x-3">
          <PermissionGate permission="add_visitor">
            <button 
              onClick={() => navigate('/security/visitors')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Visitante
            </button>
          </PermissionGate>
          <PermissionGate permission="add_accessauthorization">
            <button 
              onClick={() => navigate('/security/authorizations')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Autorización
            </button>
          </PermissionGate>
          <PermissionGate permission="add_visitor">
            <button 
              onClick={() => navigate('/security/attendance')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Registrar Asistencia
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
          <PermissionGate permission="view_visitor">
            <button 
              onClick={() => navigate('/security/visitors')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Visitantes</h4>
              <p className="text-sm text-gray-500">Gestionar base de datos de visitantes</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_accessauthorization">
            <button 
              onClick={() => navigate('/security/authorizations')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Autorizaciones</h4>
              <p className="text-sm text-gray-500">Gestionar autorizaciones de acceso</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_accessevent">
            <button 
              onClick={() => navigate('/security/events')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Eye className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Eventos de Acceso</h4>
              <p className="text-sm text-gray-500">Ver registro de entradas y salidas</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_securityincident">
            <button 
              onClick={() => navigate('/security/incidents')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900">Incidentes</h4>
              <p className="text-sm text-gray-500">Gestionar incidentes de seguridad</p>
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
