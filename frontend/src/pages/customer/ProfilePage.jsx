import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { FaUser, FaKey, FaEdit, FaSave, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import useAuthStore from '../../store/authStore';

const ProfilePage = () => {
  const { user: authUser, updateUser: updateAuthUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    username: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getMyProfile();
      const userData = response.data.data.user;
      
      setProfileData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        username: userData.username || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form data when entering edit mode
      fetchUserProfile();
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await userService.updateMyProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber
      });
      
      const updatedUser = response.data.data.user;
      
      // Update auth store with new user data
      updateAuthUser({
        ...authUser,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      });
      
      setSuccess('Cập nhật thông tin thành công');
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setChangingPassword(true);
      setError(null);
      setSuccess(null);
      
      await userService.updateMyPassword(passwordData);
      
      setSuccess('Cập nhật mật khẩu thành công');
      toast.success('Cập nhật mật khẩu thành công');
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại sau.');
      toast.error('Không thể cập nhật mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };
  
  return (
    <Container className="py-5">
      <h2 className="mb-4">Thông tin tài khoản</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Đang tải thông tin...</p>
        </div>
      ) : (
        <Row>
          <Col md={4} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px', fontSize: '40px' }}>
                    {profileData.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h4>{profileData.fullName}</h4>
                <p className="text-muted">@{profileData.username}</p>
                <div className="d-grid gap-2 mt-3">
                  <Button variant="outline-primary" onClick={() => setActiveTab('profile')}>
                    <FaUser className="me-2" /> Thông tin cá nhân
                  </Button>
                  <Button variant="outline-secondary" onClick={() => setActiveTab('password')}>
                    <FaKey className="me-2" /> Đổi mật khẩu
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Header>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
                >
                  <Tab eventKey="profile" title={<><FaUser className="me-2" /> Thông tin cá nhân</>} />
                  <Tab eventKey="password" title={<><FaKey className="me-2" /> Đổi mật khẩu</>} />
                </Tabs>
              </Card.Header>
              
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                {activeTab === 'profile' && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Thông tin cá nhân</h5>
                      <Button 
                        variant={isEditing ? "outline-secondary" : "outline-primary"} 
                        size="sm"
                        onClick={toggleEditMode}
                      >
                        {isEditing ? (
                          <><FaTimes className="me-1" /> Hủy</>
                        ) : (
                          <><FaEdit className="me-1" /> Chỉnh sửa</>
                        )}
                      </Button>
                    </div>
                    
                    <Form onSubmit={handleUpdateProfile}>
                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={profileData.username}
                          disabled={true}
                        />
                        <Form.Text className="text-muted">
                          Tên đăng nhập không thể thay đổi
                        </Form.Text>
                      </Form.Group>
                      
                      {isEditing && (
                        <div className="d-grid gap-2 mt-4">
                          <Button 
                            variant="primary" 
                            type="submit"
                            disabled={saving}
                          >
                            {saving ? (
                              <><Spinner size="sm" animation="border" className="me-2" /> Đang lưu...</>
                            ) : (
                              <><FaSave className="me-2" /> Lưu thay đổi</>
                            )}
                          </Button>
                        </div>
                      )}
                    </Form>
                  </>
                )}
                
                {activeTab === 'password' && (
                  <>
                    <h5 className="mb-3">Đổi mật khẩu</h5>
                    <Form onSubmit={handleUpdatePassword}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu hiện tại</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu mới</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          required
                          minLength={6}
                        />
                        <Form.Text className="text-muted">
                          Mật khẩu phải có ít nhất 6 ký tự
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          required
                          minLength={6}
                        />
                      </Form.Group>
                      
                      <div className="d-grid gap-2 mt-4">
                        <Button 
                          variant="primary" 
                          type="submit"
                          disabled={changingPassword}
                        >
                          {changingPassword ? (
                            <><Spinner size="sm" animation="border" className="me-2" /> Đang cập nhật...</>
                          ) : (
                            <><FaCheck className="me-2" /> Cập nhật mật khẩu</>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProfilePage; 