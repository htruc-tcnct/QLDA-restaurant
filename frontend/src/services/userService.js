import api from "./api";

const userService = {
  // User self management
  getMyProfile: async () => {
    return api.get("/api/v1/users/me");
  },

  updateMyProfile: async (userData) => {
    return api.patch("/api/v1/users/update-me", userData);
  },

  updateMyPassword: async (passwordData) => {
    return api.patch("/api/v1/users/update-password", passwordData);
  },

  // Admin management
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get("/api/v1/admin/users", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserProfile: async (userId) => {
    return api.get(`/api/v1/users/${userId}`);
  },

  updateUser: async (userId, userData) => {
    return api.patch(`/api/v1/users/${userId}`, userData);
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/v1/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/api/v1/admin/users/${userId}/status`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
