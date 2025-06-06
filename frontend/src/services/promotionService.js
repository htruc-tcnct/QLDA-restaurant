import api from './api';

/**
 * Promotion Service - Quản lý các API liên quan đến mã khuyến mãi
 */
const promotionService = {
  /**
   * Lấy danh sách mã khuyến mãi
   * @returns {Promise} Promise với dữ liệu mã khuyến mãi
   */
  getAllPromotions: async () => {
    return api.get('/api/v1/promotions');
  },
  
  /**
   * Lấy chi tiết một mã khuyến mãi
   * @param {String} promotionId - ID của mã khuyến mãi
   * @returns {Promise} Promise với dữ liệu chi tiết mã khuyến mãi
   */
  getPromotionById: async (promotionId) => {
    return api.get(`/api/v1/promotions/${promotionId}`);
  },
  
  /**
   * Tạo mã khuyến mãi mới
   * @param {Object} promotionData - Dữ liệu mã khuyến mãi mới
   * @returns {Promise} Promise với dữ liệu mã khuyến mãi đã tạo
   */
  createPromotion: async (promotionData) => {
    return api.post('/api/v1/promotions', promotionData);
  },
  
  /**
   * Cập nhật mã khuyến mãi
   * @param {String} promotionId - ID của mã khuyến mãi
   * @param {Object} promotionData - Dữ liệu cập nhật
   * @returns {Promise} Promise với dữ liệu mã khuyến mãi đã cập nhật
   */
  updatePromotion: async (promotionId, promotionData) => {
    return api.patch(`/api/v1/promotions/${promotionId}`, promotionData);
  },
  
  /**
   * Xóa mã khuyến mãi
   * @param {String} promotionId - ID của mã khuyến mãi
   * @returns {Promise} Promise kết quả xóa
   */
  deletePromotion: async (promotionId) => {
    return api.delete(`/api/v1/promotions/${promotionId}`);
  },
  
  /**
   * Kiểm tra mã khuyến mãi có hợp lệ không
   * @param {String} code - Mã khuyến mãi
   * @param {Number} orderTotal - Tổng giá trị đơn hàng
   * @returns {Promise} Promise với kết quả kiểm tra
   */
  validatePromotion: async (code, orderTotal) => {
    return api.post('/api/v1/promotions/validate', { code, orderTotal });
  },
  
  /**
   * Áp dụng mã khuyến mãi (tăng số lần sử dụng)
   * @param {String} code - Mã khuyến mãi
   * @returns {Promise} Promise với kết quả áp dụng
   */
  applyPromotion: async (code) => {
    return api.post('/api/v1/promotions/apply', { code });
  }
};

export default promotionService; 