import api from './api';

// Get all promotions with pagination and filters
export const getPromotions = async (page = 1, limit = 10, filters = {}) => {
  const params = { page, limit, ...filters };
  const response = await api.get('/api/v1/promotions', { params });
  return response.data;
};

// Get a single promotion by ID
export const getPromotion = async (id) => {
  const response = await api.get(`/api/v1/promotions/${id}`);
  return response.data;
};

// Create a new promotion
export const createPromotion = async (promotionData) => {
  const response = await api.post('/api/v1/promotions', promotionData);
  return response.data;
};

// Update an existing promotion
export const updatePromotion = async (id, promotionData) => {
  const response = await api.put(`/api/v1/promotions/${id}`, promotionData);
  return response.data;
};

// Delete a promotion
export const deletePromotion = async (id) => {
  const response = await api.delete(`/api/v1/promotions/${id}`);
  return response.data;
};

// Toggle promotion active status
export const togglePromotionStatus = async (id) => {
  const response = await api.patch(`/api/v1/promotions/${id}/toggle-status`);
  return response.data;
};

// Apply a promotion code to an order
export const applyPromoCode = async (code, orderTotal) => {
  const response = await api.post('/api/v1/promotions/apply-code', {
    code,
    orderTotal
  });
  return response.data;
}; 