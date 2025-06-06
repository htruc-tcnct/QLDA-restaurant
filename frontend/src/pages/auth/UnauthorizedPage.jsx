import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import { Button } from 'react-bootstrap';

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const { requiredRoles = [], userRole, attemptedPath } = location.state || {};

  // Map roles to friendly names
  const roleNames = {
    'admin': 'Quản trị viên',
    'manager': 'Quản lý',
    'chef': 'Đầu bếp',
    'waiter': 'Nhân viên phục vụ',
    'staff': 'Nhân viên',
    'customer': 'Khách hàng'
  };

  // Get appropriate home page based on user role
  const getHomePage = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
      case 'manager':
        return '/admin';
      case 'waiter':
      case 'staff':
        return '/waiter/pos';
      case 'chef':
        return '/admin/orders';
      case 'customer':
      default:
        return '/';
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <div className="card shadow">
            <div className="card-body p-5">
              <FaExclamationTriangle className="text-warning mb-4" size={80} />
              <h1 className="display-4 mb-4">Truy cập bị từ chối</h1>
              <p className="lead mb-4">
                Bạn không có quyền truy cập vào trang này.
              </p>
              
              {userRole && (
                <div className="alert alert-info mb-4">
                  <p><strong>Vai trò của bạn:</strong> {roleNames[userRole] || userRole}</p>
                  {requiredRoles.length > 0 && (
                    <p><strong>Vai trò cần thiết:</strong> {requiredRoles.map(role => roleNames[role] || role).join(', ')}</p>
                  )}
                  {attemptedPath && (
                    <p><strong>Đường dẫn đã truy cập:</strong> {attemptedPath}</p>
                  )}
                </div>
              )}
              
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleGoBack}
                >
                  <FaArrowLeft className="me-2" /> Quay lại
                </Button>
                
                <Link
                  to={getHomePage()}
                  className="btn btn-primary btn-lg"
                >
                  <FaHome className="me-2" /> Trang chủ
                </Link>
                
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  <FaSignOutAlt className="me-2" /> Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 