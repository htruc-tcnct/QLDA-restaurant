import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import PropTypes from 'prop-types';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  console.log('[RoleBasedRoute] Current Location:', location.pathname);
  console.log('[RoleBasedRoute] Allowed Roles:', allowedRoles);
  console.log('[RoleBasedRoute] User:', user);
  console.log('[RoleBasedRoute] IsAuthenticated:', isAuthenticated);
  console.log('[RoleBasedRoute] User Role:', user?.role);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[RoleBasedRoute] Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role not allowed, redirect to unauthorized
  if (!allowedRoles.includes(user?.role)) {
    console.log('[RoleBasedRoute] Role not allowed. User role:', user?.role, 'Allowed roles:', allowedRoles, 'Redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('[RoleBasedRoute] Role is allowed, rendering Outlet.');
  // If authenticated and role allowed, render the child routes
  return <Outlet />;
};

RoleBasedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RoleBasedRoute; 