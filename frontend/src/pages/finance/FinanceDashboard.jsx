import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Building,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCharges: 0,
    pendingCharges: 0,
    paidCharges: 0,
    overdueCharges: 0,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const { canPerformAction } = usePermissions();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [charges, payments] = await Promise.all([
        financeService.getUnitCharges({ page_size: 1000 }),
        financeService.getPayments({ page_size: 1000 })
      ]);

      const chargesData = charges.data.results || charges.data;
      const paymentsData = payments.data.results || payments.data;

      const totalCharges = chargesData.length;
      const pendingCharges = chargesData.filter(c => c.status === 'pending').length;
      const paidCharges = chargesData.filter(c => c.status === 'paid').length;
      const overdueCharges = chargesData.filter(c => c.status === 'overdue').length;

      const totalAmount = chargesData.reduce((sum, c) => sum + parseFloat(c.amount), 0);
      const pendingAmount = chargesData
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);
      const paidAmount = paymentsData.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const overdueAmount = chargesData
        .filter(c => c.status === 'overdue')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

      setStats({
        totalCharges,
        pendingCharges,
        paidCharges,
        overdueCharges,
        totalAmount,
        pendingAmount,
        paidAmount,
        overdueAmount
      });
    } catch (error) {
      console.error('Error fetching finance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCharges = () => {
    // Abrir modal o navegar a página de generación de cargos
    navigate('/finance/generate-charges');
  };

  const handleRegisterPayment = () => {
    // Abrir modal o navegar a página de registro de pagos
    navigate('/finance/register-payment');
  };

  const statCards = [
    {
      title: 'Total Cargos',
      value: stats.totalCharges,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pendientes',
      value: stats.pendingCharges,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pagados',
      value: stats.paidCharges,
      icon: CreditCard,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Vencidos',
      value: stats.overdueCharges,
      icon: TrendingUp,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const amountCards = [
    {
      title: 'Monto Total',
      value: `$${stats.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pendiente',
      value: `$${stats.pendingAmount.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Recaudado',
      value: `$${stats.paidAmount.toLocaleString()}`,
      icon: CreditCard,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Vencido',
      value: `$${stats.overdueAmount.toLocaleString()}`,
      icon: TrendingUp,
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Financiero</h1>
          <p className="text-gray-600">Resumen de la situación financiera del condominio</p>
        </div>
        <div className="flex space-x-3">
          <PermissionGate permission="add_unitcharge">
            <button 
              onClick={handleGenerateCharges}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Generar Cargos
            </button>
          </PermissionGate>
          <PermissionGate permission="add_payment">
            <button 
              onClick={handleRegisterPayment}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Registrar Pago
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

      {/* Amount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {amountCards.map((card, index) => {
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
          <PermissionGate permission="view_unitcharge">
            <button 
              onClick={() => navigate('/finance/charges')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Ver Cargos</h4>
              <p className="text-sm text-gray-500">Gestionar cargos por unidad</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_payment">
            <button 
              onClick={() => navigate('/finance/payments')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <CreditCard className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Ver Pagos</h4>
              <p className="text-sm text-gray-500">Historial de pagos</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_feeconcept">
            <button 
              onClick={() => navigate('/finance/concepts')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Building className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Conceptos</h4>
              <p className="text-sm text-gray-500">Gestionar conceptos de cobro</p>
            </button>
          </PermissionGate>
          
          <PermissionGate permission="view_billingperiod">
            <button 
              onClick={() => navigate('/finance/periods')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
              <h4 className="font-medium text-gray-900">Períodos</h4>
              <p className="text-sm text-gray-500">Gestionar períodos de facturación</p>
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
