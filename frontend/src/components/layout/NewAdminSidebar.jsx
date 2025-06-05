import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUtensils, 
  FaUsers, 
  FaShoppingCart, 
  FaClipboardList, 
  FaCog, 
  FaCalendarAlt,
  FaTable,
  FaCashRegister,
  FaChartLine,
  FaTags
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

export default function NewAdminSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Define all possible menu items
  const allMenuItems = [
    { path: '/admin', icon: <FaHome />, label: 'Dashboard', roles: ['admin', 'manager', 'staff', 'waiter'] },
    { path: '/admin/menu', icon: <FaUtensils />, label: 'Quản lý thực đơn', roles: ['admin', 'manager'] },
    { path: '/admin/users', icon: <FaUsers />, label: 'Quản lý người dùng', roles: ['admin', 'manager'] },
    { path: '/admin/tables', icon: <FaTable />, label: 'Quản lý bàn', roles: ['admin', 'manager', 'staff', 'waiter'] },
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Quản lý đơn hàng', roles: ['admin', 'manager', 'staff', 'waiter'] },
    { path: '/admin/bookings', icon: <FaCalendarAlt />, label: 'Quản lý đặt bàn', roles: ['admin', 'manager', 'staff', 'waiter'] },
    { path: '/admin/pos', icon: <FaCashRegister />, label: 'Màn hình POS', roles: ['admin', 'manager'] },
    { path: '/admin/reports', icon: <FaChartLine />, label: 'Báo cáo & Thống kê', roles: ['admin', 'manager'] },
    { path: '/admin/promotions', icon: <FaTags />, label: 'Quản lý khuyến mãi', roles: ['admin', 'manager'] },
    { path: '/admin/settings', icon: <FaCog />, label: 'Cài đặt', roles: ['admin', 'manager'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    // If no user or no roles specified, don't show the item
    if (!user || !item.roles) return false;
    
    // Check if the user's role is included in the allowed roles for this menu item
    return item.roles.includes(user.role);
  });

  return (
    <div className="admin-sidebar bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="logo p-3 border-bottom">
        <Link to="/admin" className="text-white text-decoration-none">
          <h4>Restaurant Admin</h4>
        </Link>
      </div>
      <nav className="mt-3">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link text-white py-3 px-4 d-flex align-items-center gap-2 ${
                  location.pathname === item.path ? 'active bg-primary' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 