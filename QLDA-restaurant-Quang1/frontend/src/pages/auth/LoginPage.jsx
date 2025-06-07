import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import restaurantLogo from '../../assets/restaurant-logo.svg'; // Updated to SVG format
import api from '../../services/api';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [apiStatus, setApiStatus] = useState(null);
  
  // Kiểm tra trạng thái API khi trang tải
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus('checking');
        await api.get('/api/auth/me');
        setApiStatus('online');
      } catch (error) {
        // Nếu lỗi 401 thì API vẫn hoạt động, chỉ là chưa đăng nhập
        if (error.response && error.response.status === 401) {
          setApiStatus('online');
        } else {
          console.error('API check error:', error);
          setApiStatus('offline');
        }
      }
    };
    
    checkApiStatus();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
    
    // Clear global error when user types
    if (error) {
      clearError();
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Validate login (username or email)
    if (!formData.login.trim()) {
      errors.login = 'Username or email is required';
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Redirect user based on role
  const redirectBasedOnRole = (user) => {
    // If there's a specific page the user was trying to access, go there
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from);
      return;
    }

    // Otherwise, redirect based on role
    switch (user.role) {
      case 'admin':
      case 'manager':
        navigate('/admin');
        break;
      case 'waiter':
        // Waiters primarily use POS but can also access orders
        toast.info('Bạn có thể truy cập màn hình POS và quản lý đơn hàng mới');
        navigate('/waiter/pos');
        break;
      case 'staff':
        // Staff can access POS and orders
        toast.info('Bạn có thể truy cập màn hình POS và quản lý đơn hàng');
        navigate('/waiter/pos');
        break;
      case 'chef':
        navigate('/admin/orders');
        break;
      case 'customer':
      default:
        navigate('/');
        break;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('Submitting login form with data:', formData);
    const success = await login(formData);
    if (success) {
      // Get the current user from the auth store
      const user = useAuthStore.getState().user;
      redirectBasedOnRole(user);
    }
  };
  
  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-header bg-primary text-white text-center py-4">
                <div className="d-flex justify-content-center mb-3">
                  <img 
                    src={restaurantLogo} 
                    alt="Restaurant Logo" 
                    className="img-fluid" 
                    style={{ maxHeight: '80px' }} 
                  />
                </div>
                <h2 className="fw-bold mb-0">Welcome Back</h2>
                <p className="mb-0">Sign in to continue to your account</p>
              </div>
              
              <div className="card-body p-4 p-md-5">
                {/* API Status Indicator */}
                {apiStatus === 'offline' && (
                  <div className="alert alert-warning d-flex align-items-center" role="alert">
                    <FaExclamationTriangle className="me-2" />
                    <div>
                      API server appears to be offline. Login may not work.
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Username or Email */}
                  <div className="mb-4">
                    <label htmlFor="login" className="form-label">
                      Username or Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.login ? 'is-invalid' : ''}`}
                        id="login"
                        name="login"
                        placeholder="Enter your username or email"
                        value={formData.login}
                        onChange={handleChange}
                      />
                      {validationErrors.login && (
                        <div className="invalid-feedback">{validationErrors.login}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Password */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white">
                        <FaLock />
                      </span>
                      <input
                        type="password"
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback">{validationErrors.password}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Remember me & Forgot password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-primary small fw-bold">
                      Forgot Password?
                    </Link>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isLoading || apiStatus === 'offline'}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="card-footer bg-light p-4 text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-bold">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 