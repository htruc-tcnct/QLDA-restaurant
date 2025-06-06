import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import socketService from '../../services/socketService';
import useAuthStore from '../../store/authStore';
import notificationSound from '../../assets/sounds/notification.mp3';

const AdminNotification = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    try {
      // Create audio element
      audioRef.current = new Audio(notificationSound);
      
      // Only initialize socket if authenticated
      if (isAuthenticated) {
        // Initialize socket connection if not already initialized
        // Use a mock user ID for testing if user is not authenticated
        const userId = user?._id || 'guest-user';
        if (!socketService.isConnected()) {
          socketService.initialize(userId);
        }
        
        // Set up listener for admin notifications
        const removeListener = socketService.addListener('admin_notification', handleNotification);
        const removeBookingListener = socketService.addListener('new_booking', handleNotification);
        
        // Request notification permission
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
        
        return () => {
          // Clean up listeners
          removeListener();
          removeBookingListener();
        };
      }
    } catch (error) {
      console.error('Error initializing AdminNotification:', error);
    }
  }, [user, isAuthenticated]);
  
  // Handle incoming notification
  const handleNotification = (data) => {
    try {
      console.log('Received notification:', data);
      
      // Set notification data
      setNotification(data);
      
      // Show modal
      setShowModal(true);
      
      // Play sound if sound flag is true
      if (data.sound && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error('Error playing notification sound:', err);
        });
      }
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Thông báo nhà hàng', {
          body: data.message || data.notification,
          icon: '/logo.png'
        });
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };
  
  // Handle modal close
  const handleClose = () => {
    setShowModal(false);
  };
  
  // Handle view details
  const handleViewDetails = () => {
    setShowModal(false);
  };
  
  // If no notification, don't render anything
  if (!notification) {
    return null;
  }
  
  // Get link based on notification type
  const getLink = () => {
    if (notification.type === 'new_booking' && notification.booking) {
      return `/admin/bookings/${notification.booking._id}`;
    }
    return '/admin/bookings';
  };
  
  return (
    <Modal show={showModal} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center">
            <span className="me-2">🔔</span>
            <span>Thông báo mới</span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-2">
          <h5>
            {notification.type === 'new_booking' ? 'Đặt bàn mới' : 'Thông báo hệ thống'}
          </h5>
          <p className="mb-3">{notification.message || notification.notification}</p>
          
          {notification.booking && (
            <div className="booking-details p-3 bg-light rounded mb-3">
              <div><strong>Khách hàng:</strong> {notification.booking.customerName}</div>
              <div><strong>Ngày:</strong> {notification.booking.date}</div>
              <div><strong>Giờ:</strong> {notification.booking.time}</div>
              <div><strong>Số khách:</strong> {notification.booking.numberOfGuests}</div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Link to={getLink()}>
          <Button variant="primary" onClick={handleViewDetails}>
            Xem chi tiết
          </Button>
        </Link>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminNotification; 