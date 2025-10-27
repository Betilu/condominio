import { useState, useEffect, createContext, useContext } from 'react';
import { userService } from '../api/services';
import { useAuth } from './useAuth';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      // Only fetch permissions if user is authenticated and we have user data
      if (!isAuthenticated || !user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get user's effective permissions using the current user's ID
        const permissionsResponse = await userService.getUserPermissions(user.id);
        setPermissions(permissionsResponse.data || []);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (permission) => {
    if (!isAuthenticated || !permissions || permissions.length === 0) return false;
    return permissions.some(perm => 
      perm.codename === permission || 
      perm.name === permission
    );
  };

  const hasAnyPermission = (permissionList) => {
    if (!isAuthenticated || !permissions || permissions.length === 0) return false;
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList) => {
    if (!isAuthenticated || !permissions || permissions.length === 0) return false;
    return permissionList.every(permission => hasPermission(permission));
  };

  const canAccessModule = (module) => {
    if (!isAuthenticated) return false;
    
    const modulePermissions = {
      'users': ['view_user'],
      'units': ['view_unit'],
      'finance': ['view_unitcharge', 'view_payment', 'view_feeconcept', 'view_billingperiod'],
      'notices': ['view_notice'],
      'security': ['view_visitor', 'view_accessauthorization', 'view_accessevent'],
      'amenities': ['view_amenity', 'view_amenityreservation'],
      'maintenance': ['view_asset', 'view_workorder', 'view_preventiveplan'],
      'reports': ['view_unitcharge', 'view_payment', 'view_notice', 'view_visitor', 'view_amenity', 'view_workorder']
    };

    const requiredPermissions = modulePermissions[module] || [];
    return hasAnyPermission(requiredPermissions);
  };

  const canPerformAction = (module, action) => {
    if (!isAuthenticated) return false;
    
    const actionPermissions = {
      'users': {
        'create': 'add_user',
        'read': 'view_user',
        'update': 'change_user',
        'delete': 'delete_user'
      },
      'units': {
        'create': 'add_unit',
        'read': 'view_unit',
        'update': 'change_unit',
        'delete': 'delete_unit'
      },
      'finance': {
        'create': 'add_unitcharge',
        'read': 'view_unitcharge',
        'update': 'change_unitcharge',
        'delete': 'delete_unitcharge'
      },
      'notices': {
        'create': 'add_notice',
        'read': 'view_notice',
        'update': 'change_notice',
        'delete': 'delete_notice'
      },
      'security': {
        'create': 'add_visitor',
        'read': 'view_visitor',
        'update': 'change_visitor',
        'delete': 'delete_visitor'
      },
      'amenities': {
        'create': 'add_amenity',
        'read': 'view_amenity',
        'update': 'change_amenity',
        'delete': 'delete_amenity'
      },
      'maintenance': {
        'create': 'add_workorder',
        'read': 'view_workorder',
        'update': 'change_workorder',
        'delete': 'delete_workorder'
      }
    };

    const permission = actionPermissions[module]?.[action];
    return permission ? hasPermission(permission) : false;
  };

  const value = {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    canPerformAction
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
