import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaUserShield, FaUserTie, FaUserCog, FaUser } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

const RoleNotification = () => {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);

  // Show notification when user logs in or changes
  useEffect(() => {
    if (user) {
      setShow(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!user) return null;

  // Role-specific information
  const roleInfo = {
    admin: {
      icon: <FaUserShield size={20} />,
      title: 'Quản trị viên',
      description: 'Bạn có toàn quyền truy cập vào hệ thống.',
      bg: 'primary'
    },
    manager: {
      icon: <FaUserTie size={20} />,
      title: 'Quản lý',
      description: 'Bạn có thể quản lý nhà hàng và nhân viên.',
      bg: 'info'
    },
    waiter: {
      icon: <FaUserCog size={20} />,
      title: 'Nhân viên phục vụ',
      description: 'Bạn có thể sử dụng hệ thống POS và xem đơn hàng mới.',
      bg: 'success'
    },
    staff: {
      icon: <FaUserCog size={20} />,
      title: 'Nhân viên',
      description: 'Bạn có thể sử dụng hệ thống POS và xem đơn hàng mới.',
      bg: 'success'
    },
    chef: {
      icon: <FaUserCog size={20} />,
      title: 'Đầu bếp',
      description: 'Bạn có thể xem và quản lý các đơn đặt hàng.',
      bg: 'warning'
    },
    customer: {
      icon: <FaUser size={20} />,
      title: 'Khách hàng',
      description: 'Bạn có thể đặt bàn và xem thực đơn.',
      bg: 'secondary'
    }
  };

  // Get role info or use default
  const currentRoleInfo = roleInfo[user.role] || {
    icon: <FaUser size={20} />,
    title: 'Người dùng',
    description: 'Chào mừng bạn đến với hệ thống.',
    bg: 'secondary'
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
      <Toast 
        show={show} 
        onClose={() => setShow(false)} 
        bg={currentRoleInfo.bg}
        className="text-white"
        delay={5000}
        autohide
      >
        <Toast.Header closeButton={true}>
          <span className="me-2">{currentRoleInfo.icon}</span>
          <strong className="me-auto">{currentRoleInfo.title}</strong>
          <small>Vừa đăng nhập</small>
        </Toast.Header>
        <Toast.Body>
          <div>Xin chào, <strong>{user.fullName || user.username}</strong>!</div>
          <div>{currentRoleInfo.description}</div>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default RoleNotification; 