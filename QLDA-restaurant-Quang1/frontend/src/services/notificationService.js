import api from './api';

/**
 * Notification Service - Quản lý các API liên quan đến thông báo
 */
const notificationService = {
  /**
   * Lấy danh sách thông báo cho người dùng hiện tại
   * @returns {Promise} Promise với dữ liệu thông báo
   */
  getNotifications: async () => {
    return api.get('/api/v1/notifications');
  },
  
  /**
   * Đánh dấu một thông báo là đã đọc
   * @param {String} id - ID của thông báo
   * @returns {Promise} Promise với dữ liệu thông báo đã cập nhật
   */
  markAsRead: async (id) => {
    return api.put(`/api/v1/notifications/${id}/read`);
  },
  
  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * @returns {Promise} Promise với kết quả thao tác
   */
  markAllAsRead: async () => {
    return api.put('/api/v1/notifications/read-all');
  },
  
  /**
   * Xóa một thông báo
   * @param {String} id - ID của thông báo
   * @returns {Promise} Promise với kết quả thao tác
   */
  deleteNotification: async (id) => {
    return api.delete(`/api/v1/notifications/${id}`);
  },
  
  /**
   * Lấy số lượng thông báo chưa đọc
   * @returns {Promise} Promise với số lượng thông báo chưa đọc
   */
  getUnreadCount: async () => {
    const response = await api.get('/api/v1/notifications/unread-count');
    return response.data.count;
  }
};

export default notificationService; 