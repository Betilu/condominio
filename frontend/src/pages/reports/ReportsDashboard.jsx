import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  Clock,
  Download,
  Eye,
  Filter,
  FileSpreadsheet,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const { canPerformAction } = usePermissions();

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await reportsService.getDashboardKPIs();
      setKpis(response.data);
      console.log('KPIs loaded:', response.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      toast.error('Error al cargar los KPIs del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const reportCategories = [
    {
      title: 'Reportes Financieros',
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      route: '/reports/financial',
      kpis: kpis?.financial ? [
        {
          label: 'Ingresos del Mes',
          value: `$${kpis.financial.monthly_income?.toLocaleString() || '0'}`,
          trend: '+12%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Tasa de Cobranza',
          value: `${kpis.financial.collection_rate || 0}%`,
          trend: '+5%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Deuda Total',
          value: `$${kpis.financial.total_debt?.toLocaleString() || '0'}`,
          trend: '-8%',
          trendColor: 'text-red-600'
        }
      ] : [],
      reports: [
        {
          name: 'Envejecimiento de Deuda',
          description: 'Análisis de deudas por antigüedad',
          endpoint: 'aging_debt',
          icon: TrendingUp,
          color: 'red'
        },
        {
          name: 'Tasa de Cobranza',
          description: 'Porcentaje de cobranza por período',
          endpoint: 'collection_rate',
          icon: BarChart3,
          color: 'green'
        }
      ]
    },
    {
      title: 'Reportes de Seguridad',
      icon: Shield,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      route: '/reports/security',
      kpis: kpis?.security ? [
        {
          label: 'Accesos Hoy',
          value: kpis.security.today_accesses?.toString() || '0',
          trend: '+3%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Incidentes Hoy',
          value: kpis.security.today_incidents?.toString() || '0',
          trend: kpis.security.today_incidents > 0 ? '+1' : '0',
          trendColor: kpis.security.today_incidents > 0 ? 'text-red-600' : 'text-green-600'
        },
        {
          label: 'Visitantes Activos',
          value: kpis.security.active_visitors?.toString() || '0',
          trend: '+2%',
          trendColor: 'text-green-600'
        }
      ] : [],
      reports: [
        {
          name: 'Estadísticas de Acceso',
          description: 'Análisis de entradas y salidas',
          endpoint: 'access_statistics',
          icon: BarChart3,
          color: 'blue'
        }
      ]
    },
    {
      title: 'Reportes de Amenidades',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      route: '/reports/amenities',
      kpis: kpis?.amenities ? [
        {
          label: 'Reservas Hoy',
          value: kpis.amenities.today_reservations?.toString() || '0',
          trend: '+15%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Tasa de Ocupación',
          value: `${kpis.amenities.occupancy_rate || 0}%`,
          trend: '+8%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Amenidad Más Usada',
          value: kpis.amenities.most_used_amenity || 'N/A',
          trend: '',
          trendColor: 'text-gray-600'
        }
      ] : [],
      reports: [
        {
          name: 'Uso de Amenidades',
          description: 'Estadísticas de uso y ocupación',
          endpoint: 'amenities_usage',
          icon: BarChart3,
          color: 'purple'
        }
      ]
    },
    {
      title: 'Reportes de Mantenimiento',
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      route: '/reports/maintenance',
      kpis: kpis?.maintenance ? [
        {
          label: 'Órdenes Abiertas',
          value: kpis.maintenance.open_orders?.toString() || '0',
          trend: '-5%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Completadas Hoy',
          value: kpis.maintenance.completed_today?.toString() || '0',
          trend: '+10%',
          trendColor: 'text-green-600'
        },
        {
          label: 'Costo del Mes',
          value: `$${kpis.maintenance.monthly_cost?.toLocaleString() || '0'}`,
          trend: '-3%',
          trendColor: 'text-green-600'
        }
      ] : [],
      reports: [
        {
          name: 'Resumen de Mantenimiento',
          description: 'Análisis de órdenes y costos',
          endpoint: 'maintenance_summary',
          icon: Clock,
          color: 'orange'
        }
      ]
    }
  ];

  const handleGenerateReport = async (endpoint, reportName) => {
    try {
      setLoading(true);
      const params = {
        start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };
      
      let response;
      switch (endpoint) {
        case 'aging_debt':
          response = await reportsService.getAgingDebt(params);
          break;
        case 'collection_rate':
          response = await reportsService.getCollectionRate(params);
          break;
        case 'access_statistics':
          response = await reportsService.getAccessStatistics(params);
          break;
        case 'amenities_usage':
          response = await reportsService.getAmenitiesUsage(params);
          break;
        case 'maintenance_summary':
          response = await reportsService.getMaintenanceSummary(params);
          break;
        default:
          console.error('Unknown endpoint:', endpoint);
          return;
      }
      
      console.log(`${reportName} report:`, response.data);
      toast.success(`Reporte ${reportName} generado exitosamente`);
      // Aquí podrías mostrar el reporte en un modal o nueva página
    } catch (error) {
      console.error(`Error generating ${reportName} report:`, error);
      toast.error(`Error al generar el reporte ${reportName}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (endpoint, reportName) => {
    try {
      setLoading(true);
      const params = {
        start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        report_type: endpoint
      };

      // Obtener datos del backend para exportación
      const response = await reportsService.exportReport(params);
      const exportData = response.data.data;

      if (!exportData || (Array.isArray(exportData) && exportData.length === 0)) {
        toast.error('No hay datos para exportar');
        return;
      }

      console.log(`🔄 Exportando ${reportName} con datos:`, exportData);

      // Crear workbook de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

      // Generar archivo Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Generar nombre de archivo limpio
      const cleanReportName = reportName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${cleanReportName}_${timestamp}.xlsx`;

      // Descargar archivo
      saveAs(blob, fileName);

      console.log(`✅ ${reportName} Excel exportado: ${fileName}`);
      toast.success(`Reporte ${reportName} exportado exitosamente`);

    } catch (error) {
      console.error(`❌ Error exporting ${reportName}:`, error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      toast.error(`Error al exportar ${reportName}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !kpis) {
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Reportes</h1>
          <p className="text-gray-600">KPIs y reportes de todos los módulos del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchKPIs}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Activity className="h-5 w-5 mr-2" />
            )}
            Actualizar KPIs
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/reports/quick')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Activity className="h-5 w-5 mr-2" />
              Snapshots
            </button>
            <button
              onClick={() => navigate('/reports/advanced')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Análisis Avanzado
            </button>
           
          </div>
        </div>
      </div>

      {/* General KPIs */}
      {kpis?.general ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Unidades</h3>
                <p className="text-3xl font-bold text-blue-600">{kpis.general.total_units || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Residentes</h3>
                <p className="text-3xl font-bold text-green-600">{kpis.general.total_residents || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Satisfacción</h3>
                <p className="text-3xl font-bold text-yellow-600">{kpis.general.avg_satisfaction || 0}/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Uptime</h3>
                <p className="text-3xl font-bold text-purple-600">{kpis.general.system_uptime || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              No hay datos de KPIs disponibles. Haz clic en "Actualizar KPIs" para cargar los datos.
            </p>
          </div>
        </div>
      )}

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          return (
            <div key={categoryIndex} className="bg-white shadow rounded-lg">
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${category.bgColor} p-3 rounded-lg`}>
                      <CategoryIcon className={`h-6 w-6 ${category.textColor}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">KPIs y reportes disponibles</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/reports/advanced')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver Todos
                  </button>
                </div>
              </div>
              
              {/* KPIs */}
              {category.kpis.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Indicadores Clave</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {category.kpis.map((kpi, kpiIndex) => (
                      <div key={kpiIndex} className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        <p className="text-xs text-gray-500">{kpi.label}</p>
                        {kpi.trend && (
                          <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Reports */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Reportes Disponibles</h4>
                <div className="space-y-3">
                  {category.reports.map((report, reportIndex) => {
                    const ReportIcon = report.icon;
                    return (
                      <div key={reportIndex} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ReportIcon className={`h-5 w-5 text-${report.color}-600 mr-3`} />
                            <div>
                              <h5 className="font-medium text-gray-900">{report.name}</h5>
                              <p className="text-sm text-gray-500">{report.description}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleGenerateReport(report.endpoint, report.name)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Ver reporte"
                              disabled={loading}
                            >
                              {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleExportReport(report.endpoint, report.name)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Exportar Excel"
                              disabled={loading}
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/reports/quick')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:border-green-300"
          >
            <Activity className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Snapshots Rápidos</h4>
            <p className="text-sm text-gray-500">Vista rápida de todos los módulos</p>
          </button>

          <button
            onClick={() => navigate('/reports/advanced')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:border-blue-300"
          >
            <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Análisis Avanzado</h4>
            <p className="text-sm text-gray-500">Análisis profundo con visualizaciones</p>
          </button>

          {/* <button
            onClick={() => navigate('/reports/filters')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:border-purple-300"
          >
            <Download className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Reportes con Filtros</h4>
            <p className="text-sm text-gray-500">Crea reportes con filtros específicos</p>
          </button> */}

          {/* <button
            onClick={() => navigate('/reports/dashboard')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left hover:border-orange-300"
          >
            <CheckCircle className="h-8 w-8 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Dashboard Ejecutivo</h4>
            <p className="text-sm text-gray-500">Resumen general del condominio</p>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;