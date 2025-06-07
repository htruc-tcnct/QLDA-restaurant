import { create } from 'zustand';
import api from '../services/api';
import { toast } from 'react-toastify';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Register action
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, ...user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'An error occurred during registration';

      set({
        error: message,
        isLoading: false
      });

      toast.error(message);
      return false;
    }
  },

  // Login action
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Sending login request with data:', credentials);
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);

      const { token, ...user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error details:', error);

      const message =
        error.response?.data?.message ||
        'An error occurred during login';

      set({
        error: message,
        isLoading: false
      });

      toast.error(`Login failed: ${message}`);
      return false;
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      isAuthenticated: false
    });

    toast.info('Logged out successfully');
  },

  // Load user from token
  loadUserFromToken: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }

    set({ isLoading: true });

    try {
      const response = await api.get('/api/auth/me');
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });

      return true;
    } catch (error) {
      // If token is invalid, clear storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });

      return false;
    }
  },

  // Update user data
  updateUser: (updatedUserData) => {
    const updatedUser = { ...get().user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // Set error
  setError: (message) => set({ error: message }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore; 