import { usePermissions } from '../hooks/usePermissions';

const PermissionGate = ({ 
  children, 
  permission, 
  permissions = [], 
  module, 
  action, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canPerformAction } = usePermissions();

  // Check if user has the required permission(s)
  const hasAccess = () => {
    // Single permission check
    if (permission) {
      return hasPermission(permission);
    }

    // Multiple permissions check
    if (permissions.length > 0) {
      return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    }

    // Module and action check
    if (module && action) {
      return canPerformAction(module, action);
    }

    // Default to true if no specific permission is required
    return true;
  };

  return hasAccess() ? children : fallback;
};

export default PermissionGate;
