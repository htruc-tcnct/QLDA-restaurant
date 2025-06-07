import api from './api';
import axios from 'axios';

// Create a separate instance with a longer timeout specifically for menu items
const menuApi = axios.create({
  baseURL: api.defaults.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Extended timeout of 60 seconds for menu operations
  timeout: 60000,
});

// Copy the interceptors from the main API instance
menuApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Menu API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

menuApi.interceptors.response.use(
  (response) => {
    console.log(`Menu API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Menu request timeout. Consider optimizing the API endpoint.');
    }
    return Promise.reject(error);
  }
);

/**
 * Menu Service - Quản lý các API liên quan đến thực đơn
 */
const menuService = {
  /**
   * Lấy danh sách món ăn
   * @param {Object} params - Các tham số (available, category, search, etc.)
   * @returns {Promise} Promise với dữ liệu món ăn
   */
  getMenuItems: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Thêm các tham số vào query params
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const url = `/api/menu-items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return menuApi.get(url);
  },
  
  /**
   * Lấy chi tiết một món ăn
   * @param {String} id - ID của món ăn
   * @returns {Promise} Promise với dữ liệu chi tiết món ăn
   */
  getMenuItemById: async (id) => {
    return menuApi.get(`/api/menu-items/${id}`);
  },
  
  /**
   * Lấy danh sách danh mục món ăn
   * @returns {Promise} Promise với dữ liệu danh mục
   */
  getCategories: async () => {
    return menuApi.get('/api/menu-items/categories/list');
  },
  
  /**
   * Lấy danh sách món ăn theo danh mục
   * @param {String} categoryId - ID của danh mục
   * @returns {Promise} Promise với dữ liệu món ăn
   */
  getMenuItemsByCategory: async (categoryId) => {
    return menuApi.get(`/api/menu-items?category=${categoryId}`);
  },
  
  /**
   * Tìm kiếm món ăn
   * @param {String} searchTerm - Từ khóa tìm kiếm
   * @returns {Promise} Promise với dữ liệu món ăn
   */
  searchMenuItems: async (searchTerm) => {
    return menuApi.get(`/api/menu-items?search=${searchTerm}`);
  },
  
  /**
   * Lấy danh sách món ăn phổ biến
   * @param {Number} limit - Số lượng món ăn cần lấy
   * @returns {Promise} Promise với dữ liệu món ăn
   */
  getPopularItems: async (limit = 5) => {
    return menuApi.get(`/api/menu-items/popular?limit=${limit}`);
  }
};

export default menuService; 