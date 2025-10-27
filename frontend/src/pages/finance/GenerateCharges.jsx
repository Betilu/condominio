import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService, unitsService } from '../../api/servicesWithToast';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  DollarSign,
  Building,
  Users
} from 'lucide-react';

const GenerateCharges = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [feeConcepts, setFeeConcepts] = useState([]);
  const [formData, setFormData] = useState({
    billing_period: '',
    fee_concept: '',
    due_date: '',
    units: [],
    amount: '',
    description: ''
  });
  const [conceptFilter, setConceptFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [unitsRes, conceptsRes] = await Promise.all([
        unitsService.getUnits({ page_size: 1000 }),
        financeService.getFeeConcepts({ page_size: 1000 })
      ]);
      
      setUnits(unitsRes.data.results || unitsRes.data);
      setFeeConcepts(conceptsRes.data.results || conceptsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generar cargos para las unidades seleccionadas
      const chargesData = {
        billing_period: formData.billing_period,
        fee_concept: formData.fee_concept,
        due_date: formData.due_date,
        amount: parseFloat(formData.amount),
        description: formData.description,
        units: formData.units
      };

      await financeService.generateCharges(chargesData);
      toast.success('Cargos generados exitosamente');
      navigate('/finance');
    } catch (error) {
      console.error('Error generating charges:', error);
      toast.error('Error al generar cargos');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = (unitId) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.includes(unitId)
        ? prev.units.filter(id => id !== unitId)
        : [...prev.units, unitId]
    }));
  };

  const selectAllUnits = () => {
    setFormData(prev => ({
      ...prev,
      units: units.map(unit => unit.id)
    }));
  };

  const deselectAllUnits = () => {
    setFormData(prev => ({
      ...prev,
      units: []
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Generar Cargos</h1>
          <p className="text-gray-600">Crear cargos masivos para las unidades</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Cargo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Tipo de Concepto
              </label>
              <select
                value={conceptFilter}
                onChange={(e) => setConceptFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="ordinary">Gastos Ordinarios</option>
                <option value="extraordinary">Gastos Extraordinarios</option>
                <option value="fine">Multas</option>
                <option value="other">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concepto de Cuota
              </label>
              <select
                value={formData.fee_concept}
                onChange={(e) => {
                  const selectedConcept = feeConcepts.find(c => c.id === parseInt(e.target.value));
                  setFormData(prev => ({ 
                    ...prev, 
                    fee_concept: e.target.value,
                    amount: selectedConcept ? selectedConcept.base_amount : ''
                  }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar concepto</option>
                {feeConcepts
                  .filter(concept => conceptFilter === 'all' || concept.concept_type === conceptFilter)
                  .map(concept => (
                  <option key={concept.id} value={concept.id}>
                    {concept.name} - ${concept.base_amount} ({concept.concept_type === 'ordinary' ? 'Ordinario' : concept.concept_type === 'extraordinary' ? 'Extraordinario' : concept.concept_type === 'fine' ? 'Multa' : concept.concept_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período de Facturación
              </label>
              <input
                type="text"
                value={formData.billing_period}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_period: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Enero 2024"
                required
              />
            </div>
          </div>

          {/* Información del concepto seleccionado */}
          {formData.fee_concept && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {(() => {
                const selectedConcept = feeConcepts.find(c => c.id === parseInt(formData.fee_concept));
                if (!selectedConcept) return null;
                
                return (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Información del Concepto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Descripción:</span>
                        <p className="text-blue-700">{selectedConcept.description}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Tipo de Cálculo:</span>
                        <p className="text-blue-700">
                          {selectedConcept.calculation_type === 'coefficient' ? 'Por Coeficiente' : 
                           selectedConcept.calculation_type === 'fixed' ? 'Monto Fijo' : 
                           selectedConcept.calculation_type === 'mixed' ? 'Mixto' : selectedConcept.calculation_type}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Requiere Aprobación:</span>
                        <p className="text-blue-700">{selectedConcept.requires_approval ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Estado:</span>
                        <p className="text-blue-700">{selectedConcept.is_active ? 'Activo' : 'Inactivo'}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Adicional (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descripción adicional del cargo (opcional)..."
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Seleccionar Unidades</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAllUnits}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Seleccionar Todas
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAllUnits}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Deseleccionar Todas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {units.map(unit => (
              <label key={unit.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.units.includes(unit.id)}
                  onChange={() => handleUnitToggle(unit.id)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {unit.tower?.name} - {unit.number}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-2">
            {formData.units.length} unidad(es) seleccionada(s)
          </p>
        </div>

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
            disabled={loading || formData.units.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Generar Cargos
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateCharges;
