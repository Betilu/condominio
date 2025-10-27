// ========== FRONTEND: AdvancedReports.jsx ==========

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
  CheckCircle,
  Calendar,
  Search,
  Settings
} from 'lucide-react';

const AdvancedReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedReport, setSelectedReport] = useState('');
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    unit: '',
    status: '',
    category: ''
  });
  const { canPerformAction } = usePermissions();

  const reportTypes = [
    {
      id: 'aging_debt',
      name: 'Envejecimiento de Deuda',
      description: 'Análisis detallado de deudas por antigüedad',
      icon: DollarSign,
      color: 'red',
      category: 'financial'
    },
    {
      id: 'collection_rate',
      name: 'Tasa de Cobranza',
      description: 'Porcentaje de cobranza por período',
      icon: TrendingUp,
      color: 'green',
      category: 'financial'
    },
    {
      id: 'access_statistics',
      name: 'Estadísticas de Acceso',
      description: 'Análisis de entradas y salidas',
      icon: Shield,
      color: 'blue',
      category: 'security'
    },
    {
      id: 'amenities_usage',
      name: 'Uso de Amenidades',
      description: 'Estadísticas de uso y ocupación',
      icon: Users,
      color: 'purple',
      category: 'amenities'
    },
    {
      id: 'maintenance_summary',
      name: 'Resumen de Mantenimiento',
      description: 'Análisis de órdenes y costos',
      icon: Clock,
      color: 'orange',
      category: 'maintenance'
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error('Selecciona un tipo de reporte');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      switch (selectedReport) {
        case 'aging_debt':
          response = await reportsService.getAgingDebt(filters);
          break;
        case 'collection_rate':
          response = await reportsService.getCollectionRate(filters);
          break;
        case 'access_statistics':
          response = await reportsService.getAccessStatistics(filters);
          break;
        case 'amenities_usage':
          response = await reportsService.getAmenitiesUsage(filters);
          break;
        case 'maintenance_summary':
          response = await reportsService.getMaintenanceSummary(filters);
          break;
        default:
          toast.error('Tipo de reporte no válido');
          return;
      }
      
      setReportData(response.data);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format = 'excel') => {
    if (!selectedReport) {
      toast.error('Selecciona un tipo de reporte primero');
      return;
    }

    try {
      setLoading(true);

      // Obtener datos del backend para exportación
      const response = await reportsService.exportReport({
        report_type: selectedReport,
        start_date: filters.start_date,
        end_date: filters.end_date
      });

      const exportData = response.data.data;

      if (!exportData || (Array.isArray(exportData) && exportData.length === 0)) {
        toast.error('No hay datos para exportar');
        return;
      }

      console.log('🔄 Datos recibidos para exportación:', exportData);

      // Generar nombre de archivo
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Reporte';
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'excel') {
        // Crear workbook de Excel
        const wb = XLSX.utils.book_new();

        // Convertir datos a worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

        // Generar archivo Excel
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Crear blob y descargar
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileName = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;
        saveAs(blob, fileName);

        console.log('✅ Archivo Excel generado:', fileName);
        toast.success(`Reporte Excel exportado: ${fileName}`);

      } else if (format === 'csv') {
        // Crear CSV
        const csvContent = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportData));

        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const fileName = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`;
        saveAs(blob, fileName);

        console.log('✅ Archivo CSV generado:', fileName);
        toast.success(`Reporte CSV exportado: ${fileName}`);
      }

    } catch (error) {
      console.error('❌ Error en exportación:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      toast.error(`Error al exportar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Resto del componente igual...
  const renderReportData = () => {
    if (!reportData) return null;

    const selectedReportType = reportTypes.find(r => r.id === selectedReport);
    if (!selectedReportType) return null;

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedReportType.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExportReport('excel')}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
          </div>
        </div>

        {/* Renderizado básico de datos */}
        {Array.isArray(reportData) && reportData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(reportData[0]).map((key, index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-500">No hay datos disponibles para mostrar</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <PermissionGate permission="reports.view_report">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes Avanzados</h1>
            <p className="text-gray-600">Genera reportes personalizados con filtros específicos</p>
          </div>
          <button 
            onClick={() => navigate('/reports/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Activity className="h-5 w-5 mr-2" />
            Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Reporte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar reporte</option>
                {reportTypes.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedReport}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Generar Reporte
            </button>

            <button
              onClick={() => setReportData(null)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Report Types Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const ReportIcon = report.icon;
            return (
              <div key={report.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                    <ReportIcon className={`h-6 w-6 text-${report.color}-600`} />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedReport(report.id)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedReport === report.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Data */}
        {renderReportData()}
      </div>
    </PermissionGate>
  );
};

export default AdvancedReports;