import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special handling for waiters and staff
  if (user?.role === 'waiter' || user?.role === 'staff') {
    // Check if this is a path they need access to
    const staffAccessiblePaths = [
      '/admin/orders',
      '/admin/bookings',
      '/admin/notifications',
      '/waiter/pos',
      '/admin/orders/',
      '/admin/bookings/',
      '/admin/notifications/',
      '/waiter/pos/'
    ];
    
    // Allow access if the path is in the accessible list AND they are allowed for this route
    const currentPath = location.pathname;
    const isAllowedForPath = allowedRoles.includes(user.role);
    const isAccessiblePath = staffAccessiblePaths.some(path => currentPath.startsWith(path));
    
    if (isAllowedForPath) {
      // All good, allow access
      return <Outlet />;
    } else if (isAccessiblePath) {
      // If they should have access to this path but don't have the right role,
      // redirect to the correct path
      if (currentPath.startsWith('/admin/orders')) {
        return <Navigate to="/orders" replace />;
      } else if (currentPath.startsWith('/admin/bookings')) {
        return <Navigate to="/bookings" replace />;
      } else if (currentPath.startsWith('/admin/notifications')) {
        return <Navigate to="/notifications" replace />;
      } else if (currentPath.startsWith('/waiter/pos')) {
        return <Navigate to="/pos" replace />;
      }
    }
  }

  // Check if user role is allowed
  const hasPermission = allowedRoles.includes(user?.role);

  // Show toast message when access is denied
  useEffect(() => {
    if (!hasPermission && user) {
      const roleNames = {
        'admin': 'Quản trị viên',
        'manager': 'Quản lý',
        'chef': 'Đầu bếp',
        'waiter': 'Nhân viên phục vụ',
        'staff': 'Nhân viên',
        'customer': 'Khách hàng'
      };

      const userRoleName = roleNames[user.role] || user.role;
      const requiredRoles = allowedRoles.map(role => roleNames[role] || role).join(', ');
      
      toast.error(`Bạn không có quyền truy cập. Vai trò của bạn: ${userRoleName}. Cần quyền: ${requiredRoles}`);
    }
  }, [hasPermission, user, allowedRoles]);

  // If authenticated but role not allowed, redirect to unauthorized
  if (!hasPermission) {
    // Redirect to role-specific pages for staff and waiters
    if (user?.role === 'waiter' || user?.role === 'staff') {
      return <Navigate to="/waiter/pos" replace />;
    }
    
    return <Navigate to="/unauthorized" state={{ 
      requiredRoles: allowedRoles,
      userRole: user?.role,
      attemptedPath: location.pathname
    }} replace />;
  }

  // If authenticated and role allowed, render the child routes
  return <Outlet />;
};

RoleBasedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RoleBasedRoute; 