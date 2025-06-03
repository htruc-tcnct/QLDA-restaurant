import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import PropTypes from 'prop-types';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role not allowed, redirect to unauthorized
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and role allowed, render the child routes
  return <Outlet />;
};

RoleBasedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RoleBasedRoute; 