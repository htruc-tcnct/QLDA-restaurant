import api from './api';

/**
 * Booking Service - Quản lý các API liên quan đến đặt bàn
 */
const bookingService = {
  /**
   * Lấy danh sách đặt bàn
   * @param {Object} filters - Các bộ lọc (trạng thái, khoảng thời gian, etc.)
   * @returns {Promise} Promise với dữ liệu đặt bàn
   */
  getAllBookings: async (filters = {}) => {
    let queryString = '';
    
    if (filters.status) {
      queryString += `status=${filters.status}&`;
    }
    
    if (filters.date) {
      queryString += `date=${filters.date}&`;
    }
    
    if (filters.customerId) {
      queryString += `customerId=${filters.customerId}&`;
    }
    
    // Hỗ trợ cả hai endpoint API
    const url = `/api/bookings${queryString ? '?' + queryString : ''}`;
    console.log('Requesting bookings from URL:', url);
    return api.get(url);
  },
  
  /**
   * Lấy chi tiết một đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise với dữ liệu chi tiết đặt bàn
   */
  getBookingById: async (bookingId) => {
    // Thử endpoint đầu tiên
    try {
      return await api.get(`/api/bookings/${bookingId}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Nếu không tìm thấy, thử endpoint thứ hai
        return api.get(`/api/v1/bookings/${bookingId}`);
      }
      throw error;
    }
  },
  
  /**
   * Tạo đặt bàn mới
   * @param {Object} bookingData - Dữ liệu đặt bàn mới
   * @returns {Promise} Promise với dữ liệu đặt bàn đã tạo
   */
  createBooking: async (bookingData) => {
    return api.post('/api/bookings', bookingData);
  },
  
  /**
   * Cập nhật trạng thái đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @param {Object} statusData - Dữ liệu trạng thái mới
   * @returns {Promise} Promise với dữ liệu đặt bàn đã cập nhật
   */
  updateBookingStatus: async (bookingId, statusData) => {
    try {
      return await api.put(`/api/bookings/${bookingId}/status`, statusData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.put(`/api/v1/bookings/${bookingId}/status`, statusData);
      }
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @param {Object} bookingData - Dữ liệu cập nhật
   * @returns {Promise} Promise với dữ liệu đặt bàn đã cập nhật
   */
  updateBooking: async (bookingId, bookingData) => {
    try {
      return await api.put(`/api/bookings/${bookingId}`, bookingData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.put(`/api/v1/bookings/${bookingId}`, bookingData);
      }
      throw error;
    }
  },
  
  /**
   * Hủy đặt bàn bởi khách hàng
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise kết quả hủy
   */
  cancelBooking: async (bookingId, reason) => {
    try {
      return await api.put(`/api/bookings/${bookingId}/cancel`, { reason });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.put(`/api/v1/bookings/${bookingId}/cancel`, { reason });
      }
      throw error;
    }
  },
  
  /**
   * Tạo đơn hàng từ đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise với dữ liệu đơn hàng đã tạo
   */
  createOrderFromBooking: async (bookingId) => {
    try {
      return await api.post(`/api/bookings/${bookingId}/create-order`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.post(`/api/v1/bookings/${bookingId}/create-order`);
      }
      throw error;
    }
  },
  
  /**
   * Lấy đơn hàng liên quan đến đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise với dữ liệu đơn hàng
   */
  getBookingOrder: async (bookingId) => {
    try {
      return await api.get(`/api/bookings/${bookingId}/order`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.get(`/api/v1/bookings/${bookingId}/order`);
      }
      throw error;
    }
  },
  
  /**
   * Lấy danh sách đặt bàn của khách hàng hiện tại
   * @returns {Promise} Promise với dữ liệu đặt bàn
   */
  getMyBookings: async () => {
    try {
      return await api.get('/api/bookings/my-bookings');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.get('/api/v1/bookings/my-bookings');
      }
      throw error;
    }
  },
  
  /**
   * Gán bàn cho đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @param {String} tableId - ID của bàn
   * @returns {Promise} Promise với dữ liệu đặt bàn đã gán bàn
   */
  assignTableToBooking: async (bookingId, tableId) => {
    try {
      return await api.put(`/api/bookings/${bookingId}/assign-table`, { tableId });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return api.put(`/api/v1/bookings/${bookingId}/assign-table`, { tableId });
      }
      throw error;
    }
  },
  
  /**
   * Lấy đặt bàn của ngày hôm nay
   * @returns {Promise} Promise với dữ liệu đặt bàn của ngày hôm nay
   */
  getTodaysBookings: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingService.getAllBookings({ date: today.toISOString() });
  },
  
  /**
   * Lấy đặt bàn sắp tới
   * @param {Number} days - Số ngày từ ngày hiện tại
   * @returns {Promise} Promise với dữ liệu đặt bàn sắp tới
   */
  getUpcomingBookings: async (days = 7) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    
    return bookingService.getAllBookings({
      startDate: today.toISOString(),
      endDate: endDate.toISOString()
    });
  }
};

export default bookingService; 