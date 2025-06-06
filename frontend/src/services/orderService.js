import api from './api';

/**
 * Order Service - Quản lý các API liên quan đến đơn hàng
 */
const orderService = {
  /**
   * Lấy danh sách đơn hàng
   * @param {Object} filters - Các bộ lọc (trạng thái, khoảng thời gian, etc.)
   * @returns {Promise} Promise với dữ liệu đơn hàng
   */
  getOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Thêm các bộ lọc vào query params
    if (filters.status) queryParams.append('orderStatus', filters.status);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.customerId) queryParams.append('customerId', filters.customerId);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    // Debug
    console.log('Order query params:', queryParams.toString());
    
    const url = `/api/v1/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Requesting orders from URL:', url);
    return api.get(url);
  },
  
  /**
   * Lấy chi tiết một đơn hàng
   * @param {String} orderId - ID của đơn hàng
   * @returns {Promise} Promise với dữ liệu chi tiết đơn hàng
   */
  getOrderById: async (orderId) => {
    return api.get(`/api/v1/orders/${orderId}`);
  },
  
  /**
   * Cập nhật trạng thái đơn hàng
   * @param {String} orderId - ID của đơn hàng
   * @param {Object} statusData - Dữ liệu trạng thái mới
   * @returns {Promise} Promise với dữ liệu đơn hàng đã cập nhật
   */
  updateOrderStatus: async (orderId, statusData) => {
    return api.put(`/api/v1/orders/${orderId}/status`, statusData);
  },
  
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng mới
   * @returns {Promise} Promise với dữ liệu đơn hàng đã tạo
   */
  createOrder: async (orderData) => {
    return api.post('/api/v1/orders', orderData);
  },
  
  /**
   * Cập nhật thông tin đơn hàng
   * @param {String} orderId - ID của đơn hàng
   * @param {Object} orderData - Dữ liệu cập nhật
   * @returns {Promise} Promise với dữ liệu đơn hàng đã cập nhật
   */
  updateOrder: async (orderId, orderData) => {
    return api.put(`/api/v1/orders/${orderId}`, orderData);
  },
  
  /**
   * Lấy URL in hóa đơn
   * @param {String} orderId - ID của đơn hàng
   * @returns {String} URL in hóa đơn
   */
  getReceiptUrl: (orderId) => {
    return `${api.defaults.baseURL}/api/v1/orders/${orderId}/receipt`;
  },
  
  /**
   * Lấy dữ liệu hóa đơn
   * @param {String} orderId - ID của đơn hàng
   * @returns {Promise} Promise với dữ liệu hóa đơn
   */
  getReceipt: async (orderId) => {
    return api.get(`/api/v1/orders/${orderId}/receipt`);
  },
  
  /**
   * Xóa đơn hàng
   * @param {String} orderId - ID của đơn hàng
   * @returns {Promise} Promise kết quả xóa
   */
  deleteOrder: async (orderId) => {
    return api.delete(`/api/v1/orders/${orderId}`);
  },
  
  /**
   * Xác nhận thanh toán đơn hàng
   * @param {String} orderId - ID của đơn hàng
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise} Promise với dữ liệu thanh toán
   */
  confirmPayment: async (orderId, paymentData) => {
    return api.post(`/api/v1/orders/${orderId}/payment`, paymentData);
  },
  
  /**
   * Lấy lịch sử trạng thái đơn hàng
   * @param {String} orderId - ID của đơn hàng
   * @returns {Promise} Promise với dữ liệu lịch sử trạng thái
   */
  getOrderStatusHistory: async (orderId) => {
    return api.get(`/api/v1/orders/${orderId}/status-history`);
  }
};

export default orderService; 