import api from './api';

const userService = {
    // Get current user profile
    getCurrentUser: async () => {
        try {
            const response = await api.get('/api/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/api/auth/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all users (admin only)
    getAllUsers: async (params = {}) => {
        try {
            const response = await api.get('/api/admin/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user by ID (admin only)
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/api/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update user (admin only)
    updateUser: async (userId, userData) => {
        try {
            const response = await api.put(`/api/admin/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete user (admin only)
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/api/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update user status (admin only)
    updateUserStatus: async (userId, isActive) => {
        try {
            const response = await api.patch(`/api/admin/users/${userId}/status`, { isActive });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default userService; 