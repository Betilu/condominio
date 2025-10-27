import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import PermissionGate from './PermissionGate';

const PermissionTest = () => {
  const { permissions, hasPermission, canAccessModule } = usePermissions();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Prueba de Permisos</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Permisos del Usuario:</h3>
        <div className="bg-gray-100 p-3 rounded text-sm">
          {permissions.length > 0 ? (
            <ul className="space-y-1">
              {permissions.map((perm, index) => (
                <li key={index} className="flex justify-between">
                  <span>{perm.name}</span>
                  <span className="text-gray-500">({perm.codename})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay permisos asignados</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Acceso a Módulos:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['users', 'units', 'finance', 'notices', 'security', 'amenities', 'maintenance'].map(module => (
            <div key={module} className={`p-2 rounded ${canAccessModule(module) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {module}: {canAccessModule(module) ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Prueba de Botones:</h3>
        <div className="space-x-2">
          <PermissionGate permission="add_user">
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
              Crear Usuario
            </button>
          </PermissionGate>
          
          <PermissionGate permission="change_user">
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
              Editar Usuario
            </button>
          </PermissionGate>
          
          <PermissionGate permission="delete_user">
            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              Eliminar Usuario
            </button>
          </PermissionGate>
          
          <PermissionGate permission="add_unit">
            <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm">
              Crear Unidad
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};

export default PermissionTest;
