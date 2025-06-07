import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaUtensils, 
  FaClipboardList, 
  FaChartBar, 
  FaCalendarAlt, 
  FaPercent,
  FaChair,
  FaCreditCard,
  FaBell
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import notificationService from '../../services/notificationService';
import { Badge } from 'react-bootstrap';

const Sidebar = () => {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getNotifications();
        if (response.data && response.data.data) {
          const unreadNotifications = response.data.data.filter(n => !n.isRead);
          setUnreadCount(unreadNotifications.length);
        }
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };
    
    // Initial fetch
    fetchUnreadCount();
    
    // Set up interval to check for new notifications
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Determine base path for links based on user role
  const getBasePath = (defaultPath) => {
    // For waiters and staff, we need special handling
    if (user?.role === 'waiter' || user?.role === 'staff') {
      // If the path starts with /admin, we keep it
      if (defaultPath.startsWith('/admin')) {
        return defaultPath;
      }
      // Otherwise, we use the direct path
      return defaultPath.replace('/admin/', '/');
    }
    return defaultPath;
  };

  // Define menu items with role-based access
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FaHome className="me-2" />,
      path: '/admin',
      roles: ['admin', 'manager']
    },
    {
      title: 'Quản lý người dùng',
      icon: <FaUsers className="me-2" />,
      path: '/admin/users',
      roles: ['admin', 'manager']
    },
    {
      title: 'Quản lý thực đơn',
      icon: <FaUtensils className="me-2" />,
      path: '/admin/menu',
      roles: ['admin', 'manager', 'chef']
    },
    {
      title: 'Quản lý bàn',
      icon: <FaChair className="me-2" />,
      path: '/admin/tables',
      roles: ['admin', 'manager']
    },
    {
      title: 'Quản lý đơn hàng',
      icon: <FaClipboardList className="me-2" />,
      path: '/admin/orders',
      roles: ['admin', 'manager', 'chef', 'waiter', 'staff']
    },
    {
      title: 'Quản lý đặt bàn',
      icon: <FaCalendarAlt className="me-2" />,
      path: '/admin/bookings',
      roles: ['admin', 'manager', 'staff', 'waiter']
    },
    {
      title: 'Quản lý khuyến mãi',
      icon: <FaPercent className="me-2" />,
      path: '/admin/promotions',
      roles: ['admin', 'manager']
    },
    {
      title: 'Báo cáo',
      icon: <FaChartBar className="me-2" />,
      path: '/admin/reports',
      roles: ['admin', 'manager']
    },
    {
      title: 'Điểm bán hàng (POS)',
      icon: <FaCreditCard className="me-2" />,
      path: '/waiter/pos',
      roles: ['admin', 'manager', 'waiter', 'staff']
    },
    {
      title: 'Thông báo',
      icon: <FaBell className="me-2" />,
      path: '/admin/notifications',
      roles: ['admin', 'manager', 'chef', 'waiter', 'staff'],
      badge: unreadCount > 0 ? unreadCount : null
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // If no user or no roles defined, don't show the item
    if (!user || !item.roles) return false;
    
    // Show the item if the user's role is included in the item's roles
    return item.roles.includes(user.role);
  });

  return (
    <div className="bg-dark text-white h-100 sidebar">
      <div className="p-3 sidebar-header">
        <h5 className="text-center">Restaurant Management</h5>
      </div>
      <div className="p-3 sidebar-content">
        <div className="user-info mb-4">
          <div className="d-flex align-items-center mb-2">
            <div className="bg-primary rounded-circle p-2 me-2">
              <FaUsers />
            </div>
            <div>
              <div className="fw-bold">{user?.fullName || user?.username}</div>
              <div className="small text-muted text-capitalize">{user?.role}</div>
            </div>
          </div>
        </div>
        
        <nav className="nav flex-column">
          {filteredMenuItems.map((item, index) => (
            <NavLink
              key={index}
              to={getBasePath(item.path)}
              className={({ isActive }) => 
                `nav-link py-2 d-flex justify-content-between align-items-center ${isActive ? 'active bg-primary text-white' : 'text-white-50'}`
              }
            >
              <div>
                {item.icon} {item.title}
              </div>
              {item.badge && (
                <Badge bg="danger" pill>
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 