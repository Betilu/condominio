import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api/servicesWithToast';
import { 
  BarChart3, Download, Calendar, DollarSign, Users, Shield, 
  Waves, Wrench, TrendingUp, FileSpreadsheet, Filter, 
  ChevronDown, ChevronUp, Eye, Settings
} from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState({
    finance: null,
    access: null,
    amenities: null,
    maintenance: null
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    unit_filter: '',
    status_filter: '',
    category_filter: '',
    priority_filter: ''
  });

  const reportTypes = [
    {
      id: 'finance',
      name: 'Reportes Financieros',
      description: 'Análisis de pagos, morosidad y cobranza',
      icon: DollarSign,
      color: 'bg-green-500',
      reports: [
        {
          id: 'aging_debt',
          name: 'Envejecimiento de Deuda',
          description: 'Análisis de deudas por antigüedad',
          endpoint: 'getAgingDebt'
        },
        {
          id: 'collection_rate',
          name: 'Tasa de Cobranza',
          description: 'Porcentaje de cobranza por período',
          endpoint: 'getCollectionRate'
        }
      ]
    },
    {
      id: 'security',
      name: 'Reportes de Seguridad',
      description: 'Estadísticas de acceso y seguridad',
      icon: Shield,
      color: 'bg-blue-500',
      reports: [
        {
          id: 'access_statistics',
          name: 'Estadísticas de Acceso',
          description: 'Análisis de entradas y salidas',
          endpoint: 'getAccessStatistics'
        }
      ]
    },
    {
      id: 'amenities',
      name: 'Reportes de Amenidades',
      description: 'Análisis de uso de amenidades y reservas',
      icon: Waves,
      color: 'bg-purple-500',
      reports: [
        {
          id: 'amenities_usage',
          name: 'Uso de Amenidades',
          description: 'Estadísticas de uso y ocupación',
          endpoint: 'getAmenitiesUsage'
        }
      ]
    },
    {
      id: 'maintenance',
      name: 'Reportes de Mantenimiento',
      description: 'Estadísticas de órdenes de trabajo y costos',
      icon: Wrench,
      color: 'bg-orange-500',
      reports: [
        {
          id: 'maintenance_summary',
          name: 'Resumen de Mantenimiento',
          description: 'Análisis de órdenes y costos',
          endpoint: 'getMaintenanceSummary'
        }
      ]
    }
  ];

  const fetchReport = async (reportType, reportId) => {
    try {
      setLoading(true);
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        ...filters
      };

      let response;
      switch (reportId) {
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
          return;
      }

      setReports(prev => ({
        ...prev,
        [reportType]: {
          ...prev[reportType],
          [reportId]: response.data
        }
      }));
    } catch (error) {
      console.error(`Error fetching ${reportId} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = (reportType, reportId, data) => {
    try {
      const reportName = reportTypes
        .find(rt => rt.id === reportType)
        ?.reports.find(r => r.id === reportId)?.name || 'Reporte';
      
      // Crear contenido HTML para Excel
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Excel.Sheet">
          <meta name="Generator" content="Microsoft Excel 11">
          <title>${reportName}</title>
        </head>
        <body>
          <table>
      `;
      
      if (Array.isArray(data)) {
        // Para arrays, crear tabla con headers
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          htmlContent += '<tr>';
          headers.forEach(header => {
            htmlContent += `<th>${header}</th>`;
          });
          htmlContent += '</tr>';
          
          data.forEach(row => {
            htmlContent += '<tr>';
            headers.forEach(header => {
              htmlContent += `<td>${row[header] || ''}</td>`;
            });
            htmlContent += '</tr>';
          });
        }
      } else {
        // Para objetos, crear tabla con key-value pairs
        htmlContent += '<tr><th>Métrica</th><th>Valor</th></tr>';
        Object.entries(data).forEach(([key, value]) => {
          htmlContent += `<tr><td>${key}</td><td>${value}</td></tr>`;
        });
      }
      
      htmlContent += `
          </table>
        </body>
        </html>
      `;
      
      // Crear y descargar archivo
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportName}_${dateRange.start}_${dateRange.end}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const exportToCSV = (reportType, reportId, data) => {
    try {
      const reportName = reportTypes
        .find(rt => rt.id === reportType)
        ?.reports.find(r => r.id === reportId)?.name || 'Reporte';
      
      let csvContent = '';
      
      if (Array.isArray(data)) {
        // Para arrays, usar las claves del primer objeto como headers
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          csvContent = headers.join(',') + '\n';
          
          data.forEach(row => {
            const values = headers.map(header => `"${row[header] || ''}"`);
            csvContent += values.join(',') + '\n';
          });
        }
      } else {
        // Para objetos, crear CSV con key-value pairs
        csvContent = 'Métrica,Valor\n';
        Object.entries(data).forEach(([key, value]) => {
          csvContent += `"${key}","${value}"\n`;
        });
      }
      
      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportName}_${dateRange.start}_${dateRange.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const renderReportData = (reportType, reportId, data) => {
    if (!data) return <p className="text-gray-500">No hay datos disponibles</p>;

    switch (reportId) {
      case 'aging_debt':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">0-30 días</h4>
                <p className="text-2xl font-bold text-green-600">${data.current || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">31-60 días</h4>
                <p className="text-2xl font-bold text-yellow-600">${data['30_days'] || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900">61-90 días</h4>
                <p className="text-2xl font-bold text-orange-600">${data['60_days'] || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">+90 días</h4>
                <p className="text-2xl font-bold text-red-600">${data['90_plus_days'] || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Total Deuda</h4>
                <p className="text-3xl font-bold text-gray-800">${data.total_debt || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Unidades en Mora</h4>
                <p className="text-3xl font-bold text-gray-800">{data.units_in_debt || 0}</p>
              </div>
            </div>
            {data.details && data.details.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <h4 className="font-medium text-gray-900 p-4 border-b">Detalles por Unidad</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Vencido</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.details.slice(0, 10).map((detail, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {detail.unit_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {detail.concept}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {detail.due_date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              detail.days_overdue > 90 ? 'bg-red-100 text-red-800' :
                              detail.days_overdue > 60 ? 'bg-orange-100 text-orange-800' :
                              detail.days_overdue > 30 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {detail.days_overdue} días
                            </span>
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

      case 'collection_rate':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Período</h4>
                <p className="text-lg font-bold text-blue-600">{data.period || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Total Generado</h4>
                <p className="text-2xl font-bold text-green-600">${data.total_generated || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Cobrado</h4>
                <p className="text-2xl font-bold text-blue-600">${data.total_collected || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Tasa de Cobranza</h4>
                <p className="text-2xl font-bold text-purple-600">{data.collection_rate || 0}%</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Monto Pendiente</h4>
              <p className="text-3xl font-bold text-gray-800">${data.pending_amount || 0}</p>
            </div>
          </div>
        );

      case 'access_statistics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Accesos</h4>
                <p className="text-2xl font-bold text-blue-600">{data.total_accesses || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Exitosos</h4>
                <p className="text-2xl font-bold text-green-600">{data.successful_accesses || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">Fallidos</h4>
                <p className="text-2xl font-bold text-red-600">{data.failed_accesses || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Tasa de Éxito</h4>
                <p className="text-2xl font-bold text-purple-600">{data.success_rate?.toFixed(1) || 0}%</p>
              </div>
            </div>
            {data.peak_hours && data.peak_hours.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Horarios de Mayor Acceso</h4>
                <div className="space-y-2">
                  {data.peak_hours.map((hour, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{hour.hour}:00 hrs</span>
                      <span className="font-medium">{hour.count} accesos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'amenities_usage':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Total Reservas</h4>
                <p className="text-2xl font-bold text-purple-600">{data.total_reservations || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Amenidad Más Usada</h4>
                <p className="text-lg font-bold text-blue-600">{data.most_used_amenity || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Tasa de Ocupación</h4>
                <p className="text-2xl font-bold text-green-600">{data.occupancy_rate || 0}%</p>
              </div>
            </div>
            {data.amenity_usage && data.amenity_usage.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Uso por Amenidad</h4>
                <div className="space-y-2">
                  {data.amenity_usage.map((amenity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{amenity.amenity__name}</span>
                      <span className="font-medium">{amenity.count} reservas</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'maintenance_summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Órdenes</h4>
                <p className="text-2xl font-bold text-blue-600">{data.total_orders || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Completadas</h4>
                <p className="text-2xl font-bold text-green-600">{data.completed_orders || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Tasa de Completado</h4>
                <p className="text-2xl font-bold text-purple-600">{data.completion_rate?.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Costo Total</h4>
                <p className="text-2xl font-bold text-yellow-600">${data.total_cost || 0}</p>
              </div>
            </div>
            {data.orders_by_status && data.orders_by_status.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Órdenes por Estado</h4>
                <div className="space-y-2">
                  {data.orders_by_status.map((status, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{status.status}</span>
                      <span className="font-medium">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Tipo de reporte no reconocido</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Genera reportes detallados con filtros avanzados</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Fechas</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">a</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Unidad</label>
              <input
                type="text"
                placeholder="Código de unidad"
                value={filters.unit_filter}
                onChange={(e) => setFilters({...filters, unit_filter: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status_filter}
                onChange={(e) => setFilters({...filters, status_filter: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={filters.category_filter}
                onChange={(e) => setFilters({...filters, category_filter: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                <option value="financial">Financiero</option>
                <option value="security">Seguridad</option>
                <option value="amenities">Amenidades</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Report Categories */}
      <div className="space-y-6">
        {reportTypes.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.reports.map((report) => {
                    const hasData = reports[category.id]?.[report.id] !== null;
                    
                    return (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-500">{report.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchReport(category.id, report.id)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Generar reporte"
                            >
                              {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            {hasData && (
                              <>
                                <button
                                  onClick={() => exportToExcel(category.id, report.id, reports[category.id][report.id])}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Exportar Excel"
                                >
                                  <FileSpreadsheet className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => exportToCSV(category.id, report.id, reports[category.id][report.id])}
                                  className="text-purple-600 hover:text-purple-800 p-1"
                                  title="Exportar CSV"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {hasData && (
                          <div className="mt-4">
                            {renderReportData(category.id, report.id, reports[category.id][report.id])}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Reports Message */}
      {Object.values(reports).every(category => 
        !category || Object.values(category).every(data => data === null)
      ) && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes generados</h3>
          <p className="text-gray-500">Selecciona un tipo de reporte y genera uno para ver los datos aquí.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;