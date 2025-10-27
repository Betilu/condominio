import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter
} from 'lucide-react';

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAssets: 0,
    pendingWorkOrders: 0,
    completedWorkOrders: 0,
    overduePreventiveTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const { canPerformAction } = usePermissions();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [assets, workOrders, preventiveTasks] = await Promise.all([
        maintenanceService.getAssets({ page_size: 1000 }),
        maintenanceService.getWorkOrders({ page_size: 1000 }),
        maintenanceService.getPreventiveTasks({ page_size: 1000 })
      ]);

      const assetsData = assets.data.results || assets.data;
      const workOrdersData = workOrders.data.results || workOrders.data;
      const preventiveTasksData = preventiveTasks.data.results || preventiveTasks.data;

      const pendingWorkOrders = workOrdersData.filter(wo => 
        wo.status === 'pending' || wo.status === 'in_progress'
      ).length;

      const completedWorkOrders = workOrdersData.filter(wo => 
        wo.status === 'completed'
      ).length;

      const today = new Date();
      const overduePreventiveTasks = preventiveTasksData.filter(pt => {
        const dueDate = new Date(pt.due_date);
        return dueDate < today && pt.status !== 'completed';
      }).length;

      setStats({
        totalAssets: assetsData.length,
        pendingWorkOrders,
        completedWorkOrders,
        overduePreventiveTasks
      });
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Activos',
      value: stats.totalAssets,
      icon: Wrench,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Órdenes Pendientes',
      value: stats.pendingWorkOrders,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Órdenes Completadas',
      value: stats.completedWorkOrders,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Tareas Vencidas',
      value: stats.overduePreventiveTasks,
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Mantenimiento</h1>
          <p className="text-gray-600">Gestión de activos y mantenimiento preventivo/correctivo</p>
        </div>
        <div className="flex space-x-3">
          <PermissionGate permission="add_workorder">
            <button 
              onClick={() => navigate('/maintenance/work-orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Orden
            </button>
          </PermissionGate>
          <PermissionGate permission="add_asset">
            <button 
              onClick={() => navigate('/maintenance/assets')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Activo
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
          <PermissionGate permission="view_asset">
            <button 
              onClick={() => navigate('/maintenance/assets')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Wrench className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Activos</h4>
              <p className="text-sm text-gray-500">Gestionar inventario de activos</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_workorder">
            <button 
              onClick={() => navigate('/maintenance/work-orders')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Clock className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Órdenes de Trabajo</h4>
              <p className="text-sm text-gray-500">Gestionar órdenes de mantenimiento</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_preventiveplan">
            <button 
              onClick={() => navigate('/maintenance/preventive-plans')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <CheckCircle className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Planes Preventivos</h4>
              <p className="text-sm text-gray-500">Gestionar mantenimiento preventivo</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_supplier">
            <button 
              onClick={() => navigate('/maintenance/suppliers')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
              <h4 className="font-medium text-gray-900">Proveedores</h4>
              <p className="text-sm text-gray-500">Gestionar proveedores de servicios</p>
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
