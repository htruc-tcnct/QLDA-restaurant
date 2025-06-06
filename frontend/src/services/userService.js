import api from './api';

/**
 * User Service - Quản lý các API liên quan đến thông tin người dùng
 */
const userService = {
  /**
   * Lấy thông tin profile của người dùng hiện tại
   * @returns {Promise} Promise với dữ liệu profile
   */
  getMyProfile: async () => {
    return api.get('/api/v1/users/me');
  },

  /**
   * Cập nhật thông tin profile của người dùng hiện tại
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise} Promise với dữ liệu profile đã cập nhật
   */
  updateMyProfile: async (userData) => {
    return api.patch('/api/v1/users/update-me', userData);
  },

  /**
   * Cập nhật mật khẩu của người dùng hiện tại
   * @param {Object} passwordData - Dữ liệu mật khẩu
   * @returns {Promise} Promise với kết quả cập nhật
   */
  updateMyPassword: async (passwordData) => {
    return api.patch('/api/v1/users/update-password', passwordData);
  },

  /**
   * Lấy thông tin profile của một người dùng bất kỳ (chỉ admin)
   * @param {String} userId - ID của người dùng
   * @returns {Promise} Promise với dữ liệu profile
   */
  getUserProfile: async (userId) => {
    return api.get(`/api/v1/users/${userId}`);
  },

  /**
   * Cập nhật thông tin của một người dùng bất kỳ (chỉ admin)
   * @param {String} userId - ID của người dùng
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise} Promise với dữ liệu profile đã cập nhật
   */
  updateUser: async (userId, userData) => {
    return api.patch(`/api/v1/users/${userId}`, userData);
  }
};

export default userService; 