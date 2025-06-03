import axios from 'axios';

// Khi sử dụng proxy của Vite, chúng ta chỉ cần đường dẫn tương đối
const API_URL = import.meta.env.VITE_API_URL || '';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, 
      response.data ? (response.data.length > 1000 ? 'Large data...' : response.data) : '');
    return response;
  },
  (error) => {
    // Handle global errors here
    if (error.response) {
      console.error(`API Error: ${error.response.status} ${error.config.method.toUpperCase()} ${error.config.url}`, 
        error.response.data);
      
      // Handle unauthorized error
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle forbidden error
      if (error.response.status === 403) {
        // Could redirect to unauthorized page
        if (window.location.pathname !== '/unauthorized') {
          window.location.href = '/unauthorized';
        }
      }
      
      // Handle server error
      if (error.response.status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 