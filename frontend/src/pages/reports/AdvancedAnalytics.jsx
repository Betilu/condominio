import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsService } from '../../api/servicesWithToast';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Download,
  Calendar,
  DollarSign,
  Shield,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  ArrowLeft,
  Activity
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('financial');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
      id: 'financial',
      name: 'Análisis Financiero Avanzado',
      description: 'Análisis detallado de flujo de caja, deudores y tendencias',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      service: 'getAdvancedFinancialAnalysis'
    },
    {
      id: 'security',
      name: 'Reporte Detallado de Seguridad',
      description: 'Análisis de patrones de acceso e incidentes de seguridad',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      service: 'getSecurityDetailedReport'
    },
    {
      id: 'amenities',
      name: 'Análisis de Utilización de Amenidades',
      description: 'Patrones de uso y análisis de ocupación detallado',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      service: 'getAmenitiesUtilizationAnalysis'
    }
  ];

  const fetchReportData = useCallback(async (reportType = activeReport) => {
    setLoading(true);
    try {
      const selectedReport = reportTypes.find(r => r.id === reportType);
      if (!selectedReport) {
        console.log('No report type selected');
        setLoading(false);
        return;
      }

      console.log(`Fetching data for ${selectedReport.name} with params:`, dateRange);
      const response = await reportsService[selectedReport.service](dateRange);
      console.log(`${selectedReport.name} response:`, response);
      setReportData(response.data);
      console.log(`${selectedReport.name} data:`, response.data);
    } catch (error) {
      console.error('Error fetching advanced report:', error);
      toast.error(`Error al cargar el reporte: ${error.message || error}`);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [activeReport, dateRange]);

  const exportToExcel = () => {
    if (!reportData) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const selectedReport = reportTypes.find(r => r.id === activeReport);
      const wb = XLSX.utils.book_new();

      // Exportar diferentes secciones según el tipo de reporte
      if (activeReport === 'financial') {
        // KPIs
        if (reportData.kpis) {
          const kpisData = Object.entries(reportData.kpis).map(([key, value]) => ({
            'Métrica': key.replace(/_/g, ' ').toUpperCase(),
            'Valor': value
          }));
          const ws1 = XLSX.utils.json_to_sheet(kpisData);
          XLSX.utils.book_append_sheet(wb, ws1, 'KPIs');
        }

        // Top Deudores
        if (reportData.top_debtors && reportData.top_debtors.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(reportData.top_debtors);
          XLSX.utils.book_append_sheet(wb, ws2, 'Top Deudores');
        }

        // Tendencia Mensual
        if (reportData.monthly_income_trend && reportData.monthly_income_trend.length > 0) {
          const ws3 = XLSX.utils.json_to_sheet(reportData.monthly_income_trend);
          XLSX.utils.book_append_sheet(wb, ws3, 'Tendencia Mensual');
        }

        // Cargos vs Pagos
        if (reportData.charges_vs_payments && reportData.charges_vs_payments.length > 0) {
          const ws4 = XLSX.utils.json_to_sheet(reportData.charges_vs_payments);
          XLSX.utils.book_append_sheet(wb, ws4, 'Cargos vs Pagos');
        }

      } else if (activeReport === 'security') {
        // KPIs de Seguridad
        if (reportData.kpis) {
          const kpisData = Object.entries(reportData.kpis).map(([key, value]) => ({
            'Métrica': key.replace(/_/g, ' ').toUpperCase(),
            'Valor': value
          }));
          const ws1 = XLSX.utils.json_to_sheet(kpisData);
          XLSX.utils.book_append_sheet(wb, ws1, 'KPIs Seguridad');
        }

        // Eventos Diarios
        if (reportData.daily_events && reportData.daily_events.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(reportData.daily_events);
          XLSX.utils.book_append_sheet(wb, ws2, 'Eventos Diarios');
        }

        // Visitantes Frecuentes
        if (reportData.frequent_visitors && reportData.frequent_visitors.length > 0) {
          const ws3 = XLSX.utils.json_to_sheet(reportData.frequent_visitors);
          XLSX.utils.book_append_sheet(wb, ws3, 'Visitantes Frecuentes');
        }

        // Patrón por Horas
        if (reportData.hourly_pattern && reportData.hourly_pattern.length > 0) {
          const ws4 = XLSX.utils.json_to_sheet(reportData.hourly_pattern);
          XLSX.utils.book_append_sheet(wb, ws4, 'Patrón Horario');
        }

      } else if (activeReport === 'amenities') {
        // KPIs de Amenidades
        if (reportData.kpis) {
          const kpisData = Object.entries(reportData.kpis).map(([key, value]) => ({
            'Métrica': key.replace(/_/g, ' ').toUpperCase(),
            'Valor': value
          }));
          const ws1 = XLSX.utils.json_to_sheet(kpisData);
          XLSX.utils.book_append_sheet(wb, ws1, 'KPIs Amenidades');
        }

        // Uso por Amenidad
        if (reportData.amenity_usage && reportData.amenity_usage.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(reportData.amenity_usage);
          XLSX.utils.book_append_sheet(wb, ws2, 'Uso por Amenidad');
        }

        // Usuarios Activos
        if (reportData.active_users && reportData.active_users.length > 0) {
          const ws3 = XLSX.utils.json_to_sheet(reportData.active_users);
          XLSX.utils.book_append_sheet(wb, ws3, 'Usuarios Activos');
        }

        // Horarios Populares
        if (reportData.popular_hours && reportData.popular_hours.length > 0) {
          const ws4 = XLSX.utils.json_to_sheet(reportData.popular_hours);
          XLSX.utils.book_append_sheet(wb, ws4, 'Horarios Populares');
        }
      }

      // Generar archivo
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileName = `${selectedReport.name.replace(/\s+/g, '_')}_${dateRange.start_date}_${dateRange.end_date}.xlsx`;
      saveAs(blob, fileName);

      toast.success(`Reporte exportado: ${fileName}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const renderFinancialAnalysis = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs */}
        {reportData.kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Deuda Pendiente</h4>
              <p className="text-2xl font-bold text-green-600">
                ${reportData.kpis.total_pending_amount?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Cobrado en Período</h4>
              <p className="text-2xl font-bold text-blue-600">
                ${reportData.kpis.total_collected_period?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900">Promedio Mensual</h4>
              <p className="text-2xl font-bold text-purple-600">
                ${reportData.kpis.average_monthly_collection?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900">Deudores Altos</h4>
              <p className="text-2xl font-bold text-orange-600">
                {reportData.kpis.debt_concentration || '0'}
              </p>
            </div>
          </div>
        )}

        {/* Top Deudores */}
        {reportData.top_debtors && reportData.top_debtors.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top 10 Deudores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deuda Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargos Vencidos</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.top_debtors.slice(0, 10).map((debtor, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {debtor.unit__code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {`${debtor.unit__owner__first_name || ''} ${debtor.unit__owner__last_name || ''}`.trim() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        ${parseFloat(debtor.total_debt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {debtor.overdue_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tendencia de Ingresos */}
        {reportData.monthly_income_trend && reportData.monthly_income_trend.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia de Ingresos Mensuales</h3>
            <div className="space-y-3">
              {reportData.monthly_income_trend.map((month, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{month.month}</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${parseFloat(month.total).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{month.count} pagos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSecurityAnalysis = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs de Seguridad */}
        {reportData.kpis && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Total Eventos</h4>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.kpis.total_access_events || '0'}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900">Incidentes</h4>
              <p className="text-2xl font-bold text-red-600">
                {reportData.kpis.total_incidents || '0'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Visitantes Únicos</h4>
              <p className="text-2xl font-bold text-green-600">
                {reportData.kpis.unique_visitors || '0'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900">Promedio Diario</h4>
              <p className="text-2xl font-bold text-purple-600">
                {reportData.kpis.average_daily_events || '0'}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900">Tasa de Incidentes</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {reportData.kpis.incident_rate || '0'}%
              </p>
            </div>
          </div>
        )}

        {/* Visitantes Frecuentes */}
        {reportData.frequent_visitors && reportData.frequent_visitors.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Visitantes Más Frecuentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.frequent_visitors.slice(0, 10).map((visitor, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${visitor.visitor__first_name || ''} ${visitor.visitor__last_name || ''}`.trim() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.visitor__document_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {visitor.visit_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patrón Horario */}
        {reportData.hourly_pattern && reportData.hourly_pattern.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patrón de Acceso por Hora</h3>
            <div className="grid grid-cols-6 gap-2">
              {reportData.hourly_pattern.map((hour, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-medium">{hour.hour}:00</div>
                  <div className="text-lg font-bold text-blue-600">{hour.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAmenitiesAnalysis = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs de Amenidades */}
        {reportData.kpis && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900">Total Reservas</h4>
              <p className="text-2xl font-bold text-purple-600">
                {reportData.kpis.total_reservations || '0'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Total Amenidades</h4>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.kpis.total_amenities || '0'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Tasa de Utilización</h4>
              <p className="text-2xl font-bold text-green-600">
                {reportData.kpis.utilization_rate || '0'}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900">Promedio Diario</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {reportData.kpis.avg_reservations_per_day || '0'}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900">Más Popular</h4>
              <p className="text-sm font-bold text-orange-600">
                {reportData.kpis.most_popular_amenity || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Uso por Amenidad */}
        {reportData.amenity_usage && reportData.amenity_usage.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Uso por Amenidad</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amenidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.amenity_usage.map((amenity, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {amenity.amenity__name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                        {amenity.reservations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {amenity.total_hours ? `${Math.floor(amenity.total_hours / 3600)}h` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usuarios Más Activos */}
        {reportData.active_users && reportData.active_users.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Usuarios Más Activos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.active_users.slice(0, 10).map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${user.user__first_name || ''} ${user.user__last_name || ''}`.trim() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                        {user.reservation_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'financial':
        return renderFinancialAnalysis();
      case 'security':
        return renderSecurityAnalysis();
      case 'amenities':
        return renderAmenitiesAnalysis();
      default:
        return null;
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Análisis Avanzado</h1>
            <p className="text-gray-600">Reportes detallados con análisis profundo</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/reports/quick')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Activity className="h-5 w-5 mr-2" />
            Snapshots
          </button>
          <button
            onClick={() => fetchReportData()}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <RefreshCw className="h-5 w-5 mr-2" />
            )}
            Actualizar
          </button>
          {reportData && (
            <button
              onClick={exportToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                    activeReport === report.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {report.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-gray-600">Cargando análisis...</p>
            </div>
          ) : reportData ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {reportTypes.find(r => r.id === activeReport)?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Período: {reportData.period || `${dateRange.start_date} - ${dateRange.end_date}`}
                </p>
              </div>
              {renderReportContent()}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos disponibles</h3>
              <p className="text-gray-500 mb-4">No se encontraron datos para el período seleccionado.</p>
              <button
                onClick={() => fetchReportData()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;