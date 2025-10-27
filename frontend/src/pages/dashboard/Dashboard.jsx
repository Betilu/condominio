import { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  DollarSign, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  Home,
  Eye,
  UserCheck,
  Bell,
  Percent,
  Clock
} from 'lucide-react';
import { dashboardService, userService, unitsService, noticesService, financeService, securityService, amenitiesService, maintenanceService } from '../../api/servicesWithToast';
import PermissionTest from '../../components/PermissionTest';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    occupancyRate: 0,
    totalNotices: 0,
    noticeReadRate: 0,
    residentsWithIncompleteData: 0,
    // Finance stats
    totalCharges: 0,
    pendingCharges: 0,
    totalRevenue: 0,
    // Security stats
    totalVisitors: 0,
    activeAuthorizations: 0,
    pendingIncidents: 0,
    // Amenities stats
    totalAmenities: 0,
    activeReservations: 0,
    // Maintenance stats
    totalAssets: 0,
    pendingWorkOrders: 0,
    overduePreventiveTasks: 0,
    recentAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch data from multiple endpoints
        const [usersRes, unitsRes, noticesRes, chargesRes, paymentsRes, visitorsRes, authorizationsRes, incidentsRes, amenitiesRes, reservationsRes, assetsRes, workOrdersRes, preventiveTasksRes] = await Promise.all([
          userService.getUsers({ page_size: 1000 }),
          unitsService.getUnits({ page_size: 1000 }),
          noticesService.getNotices({ page_size: 1000 }),
          financeService.getUnitCharges({ page_size: 1000 }),
          financeService.getPayments({ page_size: 1000 }),
          securityService.getVisitors({ page_size: 1000 }),
          securityService.getAccessAuthorizations({ page_size: 1000 }),
          securityService.getSecurityIncidents({ page_size: 1000 }),
          amenitiesService.getAmenities({ page_size: 1000 }),
          amenitiesService.getAmenityReservations({ page_size: 1000 }),
          maintenanceService.getAssets({ page_size: 1000 }),
          maintenanceService.getWorkOrders({ page_size: 1000 }),
          maintenanceService.getPreventiveTasks({ page_size: 1000 })
        ]);

        const users = usersRes.data.results || [];
        const units = unitsRes.data.results || [];
        const notices = noticesRes.data.results || [];
        const charges = chargesRes.data.results || [];
        const payments = paymentsRes.data.results || [];
        const visitors = visitorsRes.data.results || [];
        const authorizations = authorizationsRes.data.results || [];
        const incidents = incidentsRes.data.results || [];
        const amenities = amenitiesRes.data.results || [];
        const reservations = reservationsRes.data.results || [];
        const assets = assetsRes.data.results || [];
        const workOrders = workOrdersRes.data.results || [];
        const preventiveTasks = preventiveTasksRes.data.results || [];

        // Calculate KPIs
        const totalUsers = users.length;
        const totalUnits = units.length;
        const occupiedUnits = units.filter(unit => unit.status === 'ocupada').length;
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
        
        const totalNotices = notices.length;
        const activeNotices = notices.filter(notice => notice.is_active);
        const noticeReadRate = activeNotices.length > 0 
          ? Math.round(activeNotices.reduce((sum, notice) => sum + (notice.read_rate || 0), 0) / activeNotices.length)
          : 0;

        // Count residents with incomplete data
        const residentsWithIncompleteData = users.filter(user => 
          user.is_resident && (
            !user.phone || 
            !user.document_number || 
            !user.email || 
            !user.first_name || 
            !user.last_name
          )
        ).length;

        // Finance stats
        const totalCharges = charges.length;
        const pendingCharges = charges.filter(c => c.status === 'pending').length;
        const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        // Security stats
        const totalVisitors = visitors.length;
        const activeAuthorizations = authorizations.filter(a => a.status === 'authorized').length;
        const pendingIncidents = incidents.filter(i => i.status === 'reported' || i.status === 'in_progress').length;

        // Amenities stats
        const totalAmenities = amenities.length;
        const activeReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length;

        // Maintenance stats
        const totalAssets = assets.length;
        const pendingWorkOrders = workOrders.filter(wo => wo.status === 'pending' || wo.status === 'in_progress').length;
        const today = new Date();
        const overduePreventiveTasks = preventiveTasks.filter(pt => {
          const dueDate = new Date(pt.due_date);
          return dueDate < today && pt.status !== 'completed';
        }).length;

        // Generate recent alerts
        const recentAlerts = [
          ...(occupiedUnits < totalUnits * 0.8 ? [{
            type: 'warning',
            message: `${totalUnits - occupiedUnits} unidades vacías`,
            icon: Home
          }] : []),
          ...(noticeReadRate < 70 ? [{
            type: 'info',
            message: `Tasa de lectura de avisos: ${noticeReadRate}%`,
            icon: Eye
          }] : []),
          ...(residentsWithIncompleteData > 0 ? [{
            type: 'warning',
            message: `${residentsWithIncompleteData} residentes con datos incompletos`,
            icon: UserCheck
          }] : []),
          ...(totalNotices > 0 ? [{
            type: 'info',
            message: `${totalNotices} avisos publicados`,
            icon: Bell
          }] : []),
          ...(pendingCharges > 0 ? [{
            type: 'warning',
            message: `${pendingCharges} cargos pendientes`,
            icon: DollarSign
          }] : []),
          ...(pendingIncidents > 0 ? [{
            type: 'danger',
            message: `${pendingIncidents} incidentes pendientes`,
            icon: AlertTriangle
          }] : []),
          ...(overduePreventiveTasks > 0 ? [{
            type: 'warning',
            message: `${overduePreventiveTasks} tareas de mantenimiento vencidas`,
            icon: Clock
          }] : [])
        ];

        setStats({
          totalUsers,
          totalUnits,
          occupiedUnits,
          occupancyRate,
          totalNotices,
          noticeReadRate,
          residentsWithIncompleteData,
          // Finance stats
          totalCharges,
          pendingCharges,
          totalRevenue,
          // Security stats
          totalVisitors,
          activeAuthorizations,
          pendingIncidents,
          // Amenities stats
          totalAmenities,
          activeReservations,
          // Maintenance stats
          totalAssets,
          pendingWorkOrders,
          overduePreventiveTasks,
          recentAlerts
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Unidades',
      value: stats.totalUnits,
      icon: Home,
      color: 'bg-blue-500',
      change: `${stats.occupiedUnits} ocupadas`,
      subtitle: 'Unidades registradas'
    },
    {
      name: 'Tasa de Ocupación',
      value: `${stats.occupancyRate}%`,
      icon: Percent,
      color: 'bg-green-500',
      change: `${stats.occupiedUnits}/${stats.totalUnits}`,
      subtitle: 'Unidades ocupadas'
    },
    {
      name: 'Tasa de Lectura',
      value: `${stats.noticeReadRate}%`,
      icon: Eye,
      color: 'bg-yellow-500',
      change: `${stats.totalNotices} avisos`,
      subtitle: 'Avisos leídos'
    },
    {
      name: 'Datos Incompletos',
      value: stats.residentsWithIncompleteData,
      icon: UserCheck,
      color: 'bg-red-500',
      change: 'Residentes',
      subtitle: 'Requieren actualización'
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                          <span className="sr-only">Details</span>
                          {stat.change}
                        </div>
                      </dd>
                      <dd className="text-xs text-gray-500 mt-1">
                        {stat.subtitle}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Alertas del Sistema
            </h3>
            <div className="mt-5 space-y-3">
              {stats.recentAlerts.length > 0 ? (
                stats.recentAlerts.map((alert, index) => {
                  const Icon = alert.icon;
                  const alertColors = {
                    warning: 'bg-yellow-50 text-yellow-800',
                    info: 'bg-blue-50 text-blue-800',
                    error: 'bg-red-50 text-red-800',
                    success: 'bg-green-50 text-green-800'
                  };
                  const iconColors = {
                    warning: 'text-yellow-400',
                    info: 'text-blue-400',
                    error: 'text-red-400',
                    success: 'text-green-400'
                  };
                  
                  return (
                    <div key={index} className={`flex items-center p-3 rounded-md ${alertColors[alert.type]}`}>
                      <Icon className={`h-5 w-5 mr-3 ${iconColors[alert.type]}`} />
                      <div className="text-sm">
                        {alert.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="text-sm text-gray-600">
                    No hay alertas pendientes
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Acciones Rápidas
            </h3>
            <div className="mt-5 space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <div className="text-sm font-medium text-blue-900">
                    Gestionar Usuarios
                  </div>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Administrar usuarios y roles del sistema
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-2 text-green-600" />
                  <div className="text-sm font-medium text-green-900">
                    Gestionar Unidades
                  </div>
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Administrar unidades, propietarios e inquilinos
                </div>
              </button>
              <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-yellow-600" />
                  <div className="text-sm font-medium text-yellow-900">
                    Crear Aviso
                  </div>
                </div>
                <div className="text-xs text-yellow-700 mt-1">
                  Publicar un aviso segmentado para residentes
                </div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                  <div className="text-sm font-medium text-purple-900">
                  Ver Reportes
                  </div>
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  Analizar reportes financieros y estadísticas
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Test - Temporary */}
      <div className="mt-8">
        <PermissionTest />
      </div>
    </div>
  );
};

export default Dashboard;