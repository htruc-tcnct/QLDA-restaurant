import { Link, useLocation } from "react-router-dom";
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
  FaTags,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import useAuthStore from "../../store/authStore";
import { Badge } from "react-bootstrap";
import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService";

export default function NewAdminSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getNotifications();
        if (response.data && response.data.data) {
          const unreadNotifications = response.data.data.filter(
            (n) => !n.isRead
          );
          setUnreadCount(unreadNotifications.length);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up interval to check for new notifications
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Determine the correct path based on user role
  const getPath = (defaultPath) => {
    if (user?.role === "waiter" || user?.role === "staff") {
      // Convert admin paths to direct paths for waiters/staff
      if (defaultPath === "/admin/orders") return "/admin/orders";
      if (defaultPath === "/admin/bookings") return "/admin/bookings";
      if (defaultPath === "/admin/notifications") return "/admin/notifications";
    }
    return defaultPath;
  };

  // Define all possible menu items
  const allMenuItems = [
    {
      path: "/admin",
      icon: <FaHome />,
      label: "Dashboard",
      roles: ["admin", "manager", "chef", "staff", "waiter"],
    },
    // Profile links - different paths for different roles
    {
      path: "/admin/profile",
      icon: <FaUserCircle />,
      label: "Thông tin cá nhân",
      roles: ["admin", "manager", "chef", "staff"],
    },
    {
      path: "/waiter/profile",
      icon: <FaUserCircle />,
      label: "Thông tin cá nhân",
      roles: ["waiter"],
    },
    {
      path: "/admin/menu",
      icon: <FaUtensils />,
      label: "Quản lý thực đơn",
      roles: ["admin", "manager", "chef"],
    },
    {
      path: "/admin/users",
      icon: <FaUsers />,
      label: "Quản lý người dùng",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/tables",
      icon: <FaTable />,
      label: "Quản lý bàn",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/orders",
      icon: <FaShoppingCart />,
      label: "Quản lý đơn hàng",
      roles: ["admin", "manager", "chef", "waiter", "staff"],
    },
    {
      path: "/admin/bookings",
      icon: <FaCalendarAlt />,
      label: "Quản lý đặt bàn",
      roles: ["admin", "manager", "waiter", "staff"],
    },
    {
      path: "/waiter/pos",
      icon: <FaCashRegister />,
      label: "Màn hình POS",
      roles: ["admin", "manager", "waiter", "staff"],
    },
    {
      path: "/admin/reports",
      icon: <FaChartLine />,
      label: "Báo cáo & Thống kê",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/promotions",
      icon: <FaTags />,
      label: "Quản lý khuyến mãi",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/notifications",
      icon: <FaBell />,
      label: "Thông báo",
      roles: ["admin", "manager", "chef", "waiter", "staff"],
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      path: "/admin/settings",
      icon: <FaCog />,
      label: "Cài đặt",
      roles: ["admin", "manager"],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    // If no user or no roles specified, don't show the item
    if (!user || !item.roles) return false;

    // Check if the user's role is included in the allowed roles for this menu item
    return item.roles.includes(user.role);
  });

  // Check if the current path is active
  const isActive = (path) => {
    if (location.pathname === path) return true;
    // For staff and waiters, check for both versions of the path
    if (
      (user?.role === "waiter" || user?.role === "staff") &&
      ((path === "/admin/orders" && location.pathname === "/orders") ||
        (path === "/admin/bookings" && location.pathname === "/bookings") ||
        (path === "/admin/notifications" &&
          location.pathname === "/notifications") ||
        (path === "/waiter/pos" && location.pathname === "/pos"))
    ) {
      return true;
    }
    return false;
  };

  return (
    <div
      className="admin-sidebar bg-dark text-white"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <div className="logo p-3 border-bottom">
        <Link
          to={
            user?.role === "waiter" || user?.role === "staff"
              ? "/waiter/pos"
              : "/admin"
          }
          className="text-white text-decoration-none"
        >
          <h4>Restaurant Admin</h4>
        </Link>
      </div>
      <div className="user-info p-3 border-bottom">
        <div className="d-flex align-items-center">
          <div className="bg-primary rounded-circle p-2 me-2">
            <FaUsers />
          </div>
          <div>
            <div className="fw-bold">{user?.fullName || user?.username}</div>
            <div className="small text-muted text-capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
      <nav className="mt-3">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={getPath(item.path)}
                className={`nav-link text-white py-3 px-4 d-flex align-items-center justify-content-between ${
                  isActive(item.path) ? "active bg-primary" : ""
                }`}
              >
                <div className="d-flex align-items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge bg="danger" pill>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
