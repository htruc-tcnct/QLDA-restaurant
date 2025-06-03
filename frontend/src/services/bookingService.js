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
    
    const url = `/api/v1/bookings${queryString ? '?' + queryString : ''}`;
    console.log('Requesting bookings from URL:', url);
    return api.get(url);
  },
  
  /**
   * Lấy chi tiết một đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise với dữ liệu chi tiết đặt bàn
   */
  getBookingById: async (bookingId) => {
    return api.get(`/api/v1/bookings/${bookingId}`);
  },
  
  /**
   * Tạo đặt bàn mới
   * @param {Object} bookingData - Dữ liệu đặt bàn mới
   * @returns {Promise} Promise với dữ liệu đặt bàn đã tạo
   */
  createBooking: async (bookingData) => {
    return api.post('/api/v1/bookings', bookingData);
  },
  
  /**
   * Cập nhật trạng thái đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @param {Object} statusData - Dữ liệu trạng thái mới
   * @returns {Promise} Promise với dữ liệu đặt bàn đã cập nhật
   */
  updateBookingStatus: async (bookingId, statusData) => {
    return api.put(`/api/v1/bookings/${bookingId}/status`, statusData);
  },
  
  /**
   * Cập nhật thông tin đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @param {Object} bookingData - Dữ liệu cập nhật
   * @returns {Promise} Promise với dữ liệu đặt bàn đã cập nhật
   */
  updateBooking: async (bookingId, bookingData) => {
    return api.put(`/api/v1/bookings/${bookingId}`, bookingData);
  },
  
  /**
   * Hủy đặt bàn bởi khách hàng
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise kết quả hủy
   */
  cancelBooking: async (bookingId, reason) => {
    return api.put(`/api/v1/bookings/${bookingId}/cancel`, { reason });
  },
  
  /**
   * Tạo đơn hàng từ đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise với dữ liệu đơn hàng đã tạo
   */
  createOrderFromBooking: async (bookingId) => {
    return api.post(`/api/v1/bookings/${bookingId}/create-order`);
  },
  
  /**
   * Lấy đơn hàng liên quan đến đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @returns {Promise} Promise với dữ liệu đơn hàng
   */
  getBookingOrder: async (bookingId) => {
    return api.get(`/api/v1/bookings/${bookingId}/order`);
  },
  
  /**
   * Lấy danh sách đặt bàn của khách hàng hiện tại
   * @returns {Promise} Promise với dữ liệu đặt bàn
   */
  getMyBookings: async () => {
    return api.get('/api/v1/bookings/my-bookings');
  },
  
  /**
   * Gán bàn cho đặt bàn
   * @param {String} bookingId - ID của đặt bàn
   * @param {String} tableId - ID của bàn
   * @returns {Promise} Promise với dữ liệu đặt bàn đã gán bàn
   */
  assignTableToBooking: async (bookingId, tableId) => {
    return api.put(`/api/v1/bookings/${bookingId}/assign-table`, { tableId });
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