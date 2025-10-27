import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsService } from '../../api/servicesWithToast';
import {
  TrendingUp,
  DollarSign,
  Shield,
  Users,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  ArrowLeft,
  BarChart3
} from 'lucide-react';

const QuickReports = () => {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState({
    financial: null,
    security: null,
    maintenance: null,
    amenities: null
  });
  const [loading, setLoading] = useState({
    financial: false,
    security: false,
    maintenance: false,
    amenities: false
  });

  const fetchSnapshot = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));

    try {
      let response;
      switch (type) {
        case 'financial':
          response = await reportsService.getQuickFinancialSnapshot();
          break;
        case 'security':
          response = await reportsService.getQuickSecuritySnapshot();
          break;
        case 'maintenance':
          response = await reportsService.getQuickMaintenanceSnapshot();
          break;
        case 'amenities':
          response = await reportsService.getQuickAmenitiesSnapshot();
          break;
        default:
          return;
      }

      setSnapshots(prev => ({
        ...prev,
        [type]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching ${type} snapshot:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const fetchAllSnapshots = async () => {
    await Promise.all([
      fetchSnapshot('financial'),
      fetchSnapshot('security'),
      fetchSnapshot('maintenance'),
      fetchSnapshot('amenities')
    ]);
  };

  useEffect(() => {
    fetchAllSnapshots();
  }, []);

  const SnapshotCard = ({
    title,
    icon: Icon,
    color,
    bgColor,
    data,
    loading: cardLoading,
    onRefresh,
    children
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`${bgColor} p-3 rounded-lg`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={cardLoading}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Actualizar"
          >
            {cardLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>

        {cardLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );

  const TrendIndicator = ({ value, isPositive = true }) => (
    <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
      <span className="text-sm font-medium">{Math.abs(value)}%</span>
    </div>
  );

  const StatusBadge = ({ status, text }) => {
    const statusColors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      normal: 'bg-gray-100 text-gray-800',
      alert: 'bg-red-100 text-red-800',
      high: 'bg-red-100 text-red-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
      stable: 'bg-green-100 text-green-800',
      increasing: 'bg-orange-100 text-orange-800',
      busy: 'bg-red-100 text-red-800',
      available: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {text || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/reports')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes Rápidos</h1>
            <p className="text-gray-600">Snapshots en tiempo real de todos los módulos</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/reports/advanced')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Análisis Avanzado
          </button>
          <button
            onClick={fetchAllSnapshots}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Actualizar Todo
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Financial Snapshot */}
        <SnapshotCard
          title="Snapshot Financiero"
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-100"
          data={snapshots.financial}
          loading={loading.financial}
          onRefresh={() => fetchSnapshot('financial')}
        >
          {snapshots.financial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${snapshots.financial.current_month_income?.toLocaleString() || '0'}
                  </p>
                  {snapshots.financial.income_change_percent !== undefined && (
                    <TrendIndicator
                      value={snapshots.financial.income_change_percent}
                      isPositive={snapshots.financial.income_change_percent >= 0}
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deuda Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${snapshots.financial.total_debt?.toLocaleString() || '0'}
                  </p>
                  <StatusBadge status={snapshots.financial.debt_trend} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Tasa de Cobranza</span>
                  <span className="text-lg font-semibold">{snapshots.financial.collection_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(snapshots.financial.collection_rate, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deuda Vencida:</span>
                <span className="font-medium text-red-600">
                  ${snapshots.financial.overdue_debt?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          )}
        </SnapshotCard>

        {/* Security Snapshot */}
        <SnapshotCard
          title="Snapshot de Seguridad"
          icon={Shield}
          color="text-blue-600"
          bgColor="bg-blue-100"
          data={snapshots.security}
          loading={loading.security}
          onRefresh={() => fetchSnapshot('security')}
        >
          {snapshots.security && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Eventos Hoy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {snapshots.security.today_events || '0'}
                  </p>
                  <StatusBadge status={snapshots.security.activity_trend} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <div className="flex items-center mt-2">
                    {snapshots.security.security_status === 'normal' ? (
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                    )}
                    <StatusBadge status={snapshots.security.security_status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-lg font-bold">{snapshots.security.week_events || '0'}</p>
                  <p className="text-xs text-gray-500">Eventos Semana</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-lg font-bold">{snapshots.security.unique_visitors || '0'}</p>
                  <p className="text-xs text-gray-500">Visitantes Únicos</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-lg font-bold">{snapshots.security.recent_incidents || '0'}</p>
                  <p className="text-xs text-gray-500">Incidentes</p>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Promedio Diario:</span>
                <span className="font-medium">{snapshots.security.avg_daily_events || '0'} eventos</span>
              </div>
            </div>
          )}
        </SnapshotCard>

        {/* Maintenance Snapshot */}
        <SnapshotCard
          title="Snapshot de Mantenimiento"
          icon={Clock}
          color="text-orange-600"
          bgColor="bg-orange-100"
          data={snapshots.maintenance}
          loading={loading.maintenance}
          onRefresh={() => fetchSnapshot('maintenance')}
        >
          {snapshots.maintenance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Órdenes Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {snapshots.maintenance.pending_orders || '0'}
                  </p>
                  <StatusBadge status={snapshots.maintenance.workload_status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Órdenes Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {snapshots.maintenance.urgent_orders || '0'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-lg font-bold text-green-600">{snapshots.maintenance.completed_this_month || '0'}</p>
                  <p className="text-xs text-gray-500">Completadas Este Mes</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-lg font-bold text-blue-600">{snapshots.maintenance.avg_resolution_days || '0'}</p>
                  <p className="text-xs text-gray-500">Días Promedio</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Costos del Mes:</span>
                  <div className="text-right">
                    <span className="font-medium">${snapshots.maintenance.month_costs?.toLocaleString() || '0'}</span>
                    <div className="text-xs">
                      <StatusBadge status={snapshots.maintenance.cost_trend} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SnapshotCard>

        {/* Amenities Snapshot */}
        <SnapshotCard
          title="Snapshot de Amenidades"
          icon={Users}
          color="text-purple-600"
          bgColor="bg-purple-100"
          data={snapshots.amenities}
          loading={loading.amenities}
          onRefresh={() => fetchSnapshot('amenities')}
        >
          {snapshots.amenities && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Reservas Hoy</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {snapshots.amenities.today_reservations || '0'}
                  </p>
                  <StatusBadge status={snapshots.amenities.availability_status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ocupación</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {snapshots.amenities.occupancy_rate || '0'}%
                  </p>
                  <StatusBadge status={snapshots.amenities.usage_trend} />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Más Reservada</p>
                <p className="font-semibold">{snapshots.amenities.most_reserved_amenity || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold">{snapshots.amenities.week_reservations || '0'}</p>
                  <p className="text-xs text-gray-500">Reservas Semana</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{snapshots.amenities.active_users || '0'}</p>
                  <p className="text-xs text-gray-500">Usuarios Activos</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Ocupación Semanal</span>
                  <span className="text-sm font-medium">{snapshots.amenities.occupancy_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(snapshots.amenities.occupancy_rate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </SnapshotCard>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-900">Actualización en Tiempo Real</p>
            <p className="text-xs text-blue-700">
              Los snapshots se actualizan automáticamente y muestran los datos más recientes del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickReports;