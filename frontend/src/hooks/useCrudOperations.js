import { useState } from 'react';
import { useToast } from './useToast';

export const useCrudOperations = (service, entityName) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const response = await service.getAll(params);
      setData(response.data.results || response.data);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        page: Math.floor((response.data.offset || 0) / (response.data.limit || 10)) + 1,
        totalPages: Math.ceil((response.data.count || 0) / (response.data.limit || 10))
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error);
      showError(`Error al cargar ${entityName}: ${error.response?.data?.detail || error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    const toastId = showLoading(`Creando ${entityName}...`);
    try {
      const response = await service.create(itemData);
      setData(prev => [response.data, ...prev]);
      dismissToast(toastId);
      showSuccess(`${entityName} creado exitosamente`);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error);
      dismissToast(toastId);
      showError(`Error al crear ${entityName}: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  };

  const updateItem = async (id, itemData) => {
    const toastId = showLoading(`Actualizando ${entityName}...`);
    try {
      const response = await service.update(id, itemData);
      setData(prev => prev.map(item => item.id === id ? response.data : item));
      dismissToast(toastId);
      showSuccess(`${entityName} actualizado exitosamente`);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error);
      dismissToast(toastId);
      showError(`Error al actualizar ${entityName}: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    const toastId = showLoading(`Eliminando ${entityName}...`);
    try {
      await service.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
      dismissToast(toastId);
      showSuccess(`${entityName} eliminado exitosamente`);
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      dismissToast(toastId);
      showError(`Error al eliminar ${entityName}: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  };

  const getItem = async (id) => {
    try {
      const response = await service.getById(id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error);
      showError(`Error al cargar ${entityName}: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  };

  return {
    data,
    loading,
    pagination,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    setData,
  };
};
