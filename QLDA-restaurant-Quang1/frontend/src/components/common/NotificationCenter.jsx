import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import socketService from '../../services/socketService';
import notificationSound from '../../assets/sounds/notification.mp3';

const NotificationCenter = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio on component mount
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(notif => !notif.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/v1/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put('/api/v1/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/v1/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif._id !== id)
      );
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Close dropdown after clicking
    setIsOpen(false);
  };

  // Handle real-time notification
  const handleRealtimeNotification = (data) => {
    try {
      console.log('Received real-time notification:', data);
      
      // Play sound if specified
      if (data.sound && audioRef.current) {
        audioRef.current.play().catch(err => console.error('Error playing notification sound:', err));
      }
      
      // Create notification object from data
      const newNotification = {
        _id: data._id || `temp-${Date.now()}`,
        type: data.type || 'system',
        content: data.message || data.notification,
        createdAt: new Date().toISOString(),
        isRead: false,
        relatedResource: data.booking ? {
          type: 'booking',
          id: data.booking._id
        } : null
      };
      
      // Add to notifications list
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Thông báo nhà hàng', {
          body: newNotification.content,
          icon: '/logo.png'
        });
      }
    } catch (error) {
      console.error('Error handling real-time notification:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on mount and set up socket listeners
  useEffect(() => {
    if (isAuthenticated && user && token) {
      fetchNotifications();
      
      // Initialize socket connection if not already initialized
      if (!socketService.isConnected()) {
        socketService.initialize(user._id);
      }
      
      // Set up socket listeners
      const removeNewBookingListener = socketService.addListener('new_booking', handleRealtimeNotification);
      const removeAdminNotificationListener = socketService.addListener('admin_notification', handleRealtimeNotification);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      // Clean up on unmount
      return () => {
        removeNewBookingListener();
        removeAdminNotificationListener();
      };
    } else {
      // If no user or token, just set empty notifications
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, token, isAuthenticated]);

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
        return <span className="text-blue-500">📅</span>;
      case 'order_status_change':
        return <span className="text-green-500">🛒</span>;
      case 'booking_reminder':
        return <span className="text-orange-500">⏰</span>;
      default:
        return <span className="text-gray-500">📣</span>;
    }
  };

  // Get notification link based on type and related resource
  const getNotificationLink = (notification) => {
    if (notification.relatedResource) {
      const { type, id } = notification.relatedResource;
      
      switch (type) {
        case 'booking':
          return `/admin/bookings/${id}`;
        case 'order':
          return `/admin/orders/${id}`;
        default:
          return '#';
      }
    }
    
    return '#';
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Thông báo</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-4 px-3 text-sm text-gray-500 text-center">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-3 py-3 border-b border-gray-100 hover:bg-gray-50 flex items-start ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={getNotificationLink(notification)}
                      onClick={() => handleNotificationClick(notification)}
                      className="block"
                    >
                      <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </Link>
                  </div>
                  <div className="ml-2 flex">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Đánh dấu đã đọc"
                      >
                        <FaCheck size={12} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Xóa thông báo"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 