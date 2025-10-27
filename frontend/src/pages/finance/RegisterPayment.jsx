import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService, unitsService } from '../../api/servicesWithToast';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Search,
  DollarSign,
  Building,
  CreditCard,
  Calendar
} from 'lucide-react';

const RegisterPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [charges, setCharges] = useState([]);
  const [filteredCharges, setFilteredCharges] = useState([]);
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [formData, setFormData] = useState({
    unit: '',
    payment_method: 'cash',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [unitsRes, chargesRes] = await Promise.all([
        unitsService.getUnits({ page_size: 1000 }),
        financeService.getUnitCharges({ page_size: 1000, status: 'pending' })
      ]);
      
      setUnits(unitsRes.data.results || unitsRes.data);
      const chargesData = chargesRes.data.results || chargesRes.data;
      setCharges(chargesData);
      setFilteredCharges(chargesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    }
  };

  const handleUnitChange = (unitId) => {
    setFormData(prev => ({ ...prev, unit: unitId }));
    const unitCharges = charges.filter(charge => charge.unit === parseInt(unitId));
    setFilteredCharges(unitCharges);
    setSelectedCharges([]);
  };

  const handleChargeToggle = (chargeId) => {
    setSelectedCharges(prev => 
      prev.includes(chargeId)
        ? prev.filter(id => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const calculateTotalAmount = () => {
    return selectedCharges.reduce((total, chargeId) => {
      const charge = filteredCharges.find(c => c.id === chargeId);
      return total + (charge ? parseFloat(charge.amount) : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = calculateTotalAmount();
      
      // Crear el pago
      const paymentData = {
        unit: parseInt(formData.unit),
        amount: totalAmount,
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        reference: formData.reference,
        notes: formData.notes,
        charges: selectedCharges
      };

      await financeService.createPayment(paymentData);
      toast.success('Pago registrado exitosamente');
      navigate('/finance');
    } catch (error) {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const selectAllCharges = () => {
    setSelectedCharges(filteredCharges.map(charge => charge.id));
  };

  const deselectAllCharges = () => {
    setSelectedCharges([]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/finance')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Pago</h1>
          <p className="text-gray-600">Registrar un nuevo pago de cargos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Pago</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar unidad</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.tower?.name} - {unit.number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="check">Cheque</option>
                <option value="card">Tarjeta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número de referencia o comprobante"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>
        </div>

        {formData.unit && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Cargos Pendientes</h2>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={selectAllCharges}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Seleccionar Todos
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={deselectAllCharges}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Deseleccionar Todos
                </button>
              </div>
            </div>

            {filteredCharges.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay cargos pendientes para esta unidad</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredCharges.map(charge => (
                  <label key={charge.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharges.includes(charge.id)}
                      onChange={() => handleChargeToggle(charge.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{charge.fee_concept?.name || 'Cargo'}</p>
                        <p className="text-sm text-gray-500">{charge.description}</p>
                        <p className="text-xs text-gray-400">Vence: {new Date(charge.due_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${parseFloat(charge.amount).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{charge.status}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedCharges.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total a Pagar:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${calculateTotalAmount().toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCharges.length} cargo(s) seleccionado(s)
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/finance')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || selectedCharges.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Registrar Pago
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPayment;
