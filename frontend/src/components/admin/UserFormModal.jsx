import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaUserTag, 
  FaToggleOn,
  FaSave,
  FaUserPlus,
  FaUserEdit
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { toast } from 'react-toastify';

const UserFormModal = ({ show, handleClose, mode, user, onUserSaved }) => {
  const initialFormState = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'customer',
    isActive: true
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // When user data changes or modal opens, reset form
  useEffect(() => {
    if (show) {
      if (mode === 'edit' && user) {
        // Edit mode - fill form with user data
        setFormData({
          fullName: user.fullName || '',
          username: user.username || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          phoneNumber: user.phoneNumber || '',
          role: user.role || 'customer',
          isActive: user.isActive !== undefined ? user.isActive : true
        });
      } else {
        // Add mode - reset form
        setFormData(initialFormState);
      }
      // Clear errors
      setValidationErrors({});
      setShowPassword(false);
    }
  }, [show, mode, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate fullName
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    // Validate username
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Validate password (only required in add mode)
    if (mode === 'add') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      // Validate confirmPassword
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      // In edit mode, validate password only if provided
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      // Validate confirmPassword
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Validate phoneNumber (optional)
    if (formData.phoneNumber && !/^\d{10,11}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      // Prepare data - remove confirmPassword
      const { confirmPassword, ...userData } = formData;
      
      // Remove password if empty in edit mode
      if (mode === 'edit' && !userData.password) {
        delete userData.password;
      }
      
      if (mode === 'add') {
        // Create new user
        response = await api.post('/api/admin/users', userData);
        onUserSaved(response.data, true);
      } else {
        // Update existing user
        response = await api.put(`/api/admin/users/${user._id}`, userData);
        onUserSaved(response.data, false);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save user';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (mode === 'edit' && user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'customer',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData(initialFormState);
    }
    setValidationErrors({});
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          {mode === 'add' ? (
            <>
              <FaUserPlus className="me-2 text-primary" />
              Add New User
            </>
          ) : (
            <>
              <FaUserEdit className="me-2 text-primary" />
              Edit User
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="mb-3">
            <Col md={6}>
              {/* Full Name */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="me-2" />
                  Full Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.fullName}
                  placeholder="Enter full name"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
              
              {/* Username */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="me-2" />
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.username}
                  placeholder="Enter username"
                  disabled={mode === 'edit'} // Can't change username in edit mode
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.username}
                </Form.Control.Feedback>
              </Form.Group>
              
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaEnvelope className="me-2" />
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.email}
                  placeholder="Enter email address"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.email}
                </Form.Control.Feedback>
              </Form.Group>
              
              {/* Phone Number */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPhone className="me-2" />
                  Phone Number
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.phoneNumber}
                  placeholder="Enter phone number"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.phoneNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              {/* Password */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="me-2" />
                  {mode === 'add' ? 'Password' : 'New Password'}
                </Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.password}
                    placeholder={mode === 'add' ? "Enter password" : "Enter new password (optional)"}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </div>
                {mode === 'edit' && (
                  <Form.Text className="text-muted">
                    Leave blank to keep current password
                  </Form.Text>
                )}
              </Form.Group>
              
              {/* Confirm Password */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="me-2" />
                  Confirm Password
                </Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.confirmPassword}
                  placeholder="Confirm password"
                  disabled={mode === 'edit' && !formData.password}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
              
              {/* Role */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUserTag className="me-2" />
                  Role
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              
              {/* Status */}
              <Form.Group className="mb-3">
                <Form.Label className="d-block">
                  <FaToggleOn className="me-2" />
                  Status
                </Form.Label>
                <Form.Check
                  type="switch"
                  id="user-status-switch"
                  label={formData.isActive ? "Active" : "Inactive"}
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={handleReset}>
            Reset
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
            className="d-flex align-items-center"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {mode === 'add' ? 'Create User' : 'Update User'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

UserFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']).isRequired,
  user: PropTypes.object,
  onUserSaved: PropTypes.func.isRequired
};

export default UserFormModal; 