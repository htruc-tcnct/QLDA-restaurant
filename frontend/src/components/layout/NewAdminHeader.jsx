import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaCog, FaUserCircle } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-toastify';

export default function NewAdminHeader() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Quản trị viên',
      'manager': 'Quản lý',
      'chef': 'Đầu bếp',
      'staff': 'Nhân viên',
      'waiter': 'Phục vụ'
    };
    return roleMap[role] || role;
  };

  const getProfilePath = (role) => {
    return role === 'waiter' ? '/waiter/profile' : '/admin/profile';
  };

  const getSettingsPath = (role) => {
    return role === 'waiter' ? '/waiter/settings' : '/admin/settings';
  };

  return (
    <header className="bg-white shadow-sm py-3">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="dropdown">
              <button
                className="btn position-relative"
                type="button"
                id="notificationsDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Thông báo"
              >
                <FaBell />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
                <li><h6 className="dropdown-header">Thông báo mới</h6></li>
                <li><a className="dropdown-item" href="#">Đơn hàng mới #1234</a></li>
                <li><a className="dropdown-item" href="#">Đơn hàng mới #1235</a></li>
                <li><a className="dropdown-item" href="#">Đánh giá mới được thêm</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item text-center" href="#">Xem tất cả thông báo</a></li>
              </ul>
            </div>

            {/* User Dropdown */}
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center gap-2"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Menu người dùng"
              >
                <FaUser />
                <div className="d-flex flex-column align-items-start">
                  <span className="fw-semibold">{user?.fullName || user?.username || 'User'}</span>
                  <small className="text-muted">{getRoleDisplayName(user?.role)}</small>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><h6 className="dropdown-header">Xin chào, {user?.fullName || user?.username}!</h6></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to={getProfilePath(user?.role)}>
                    <FaUserCircle className="me-2" />
                    Thông tin cá nhân
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={getSettingsPath(user?.role)}>
                    <FaCog className="me-2" />
                    Cài đặt
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 