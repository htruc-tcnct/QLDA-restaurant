import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaSave, FaEdit } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';

const AdminProfilePage = () => {
    const { user, loadUserFromToken } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    });

    // Initialize form data when component mounts or user changes
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (!formData.fullName.trim()) {
                toast.error('Họ và tên không được để trống');
                return;
            }

            if (!formData.email.trim()) {
                toast.error('Email không được để trống');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error('Định dạng email không hợp lệ');
                return;
            }

            // Update profile
            await userService.updateMyProfile({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim() || undefined,
            });

            // Reload user data to get updated info
            await loadUserFromToken();

            toast.success('Cập nhật thông tin cá nhân thành công!');
            setIsEditing(false);
        } catch (error) {
            console.error('Update profile error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi cập nhật thông tin';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original user data
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
        setIsEditing(false);
    };

    if (!user) {
        return (
            <Container>
                <Alert variant="warning">
                    Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid>
            <Row>
                <Col lg={8} xl={6}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                <FaUser className="me-2" />
                                Thông tin cá nhân
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUser className="me-2" />
                                                Tên đăng nhập
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={user.username}
                                                disabled
                                                className="bg-light"
                                            />
                                            <Form.Text className="text-muted">
                                                Tên đăng nhập không thể thay đổi
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUserTag className="me-2" />
                                                Vai trò
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={user.role === 'admin' ? 'Quản trị viên' :
                                                    user.role === 'manager' ? 'Quản lý' :
                                                        user.role === 'chef' ? 'Đầu bếp' :
                                                            user.role === 'staff' ? 'Nhân viên' :
                                                                user.role === 'waiter' ? 'Phục vụ' : 'Khách hàng'}
                                                disabled
                                                className="bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUser className="me-2" />
                                                Họ và tên *
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaEnvelope className="me-2" />
                                                Email *
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaPhone className="me-2" />
                                                Số điện thoại
                                            </Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Điểm tích lũy</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={user.loyaltyPoints || 0}
                                                disabled
                                                className="bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngày tạo tài khoản</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                                disabled
                                                className="bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Trạng thái</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={user.isActive ? 'Hoạt động' : 'Bị vô hiệu hóa'}
                                                disabled
                                                className={`bg-light text-${user.isActive ? 'success' : 'danger'} fw-bold`}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex gap-2 justify-content-end">
                                    {!isEditing ? (
                                        <Button
                                            variant="primary"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <FaEdit className="me-2" />
                                            Chỉnh sửa thông tin
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="secondary"
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                variant="success"
                                                type="submit"
                                                disabled={isLoading}
                                            >
                                                <FaSave className="me-2" />
                                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} xl={6}>
                    <Card>
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">Hướng dẫn</h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <strong>Họ và tên:</strong> Cập nhật tên đầy đủ của bạn
                                </li>
                                <li className="mb-2">
                                    <strong>Email:</strong> Email dùng để đăng nhập và nhận thông báo
                                </li>
                                <li className="mb-2">
                                    <strong>Số điện thoại:</strong> Thông tin liên hệ (không bắt buộc)
                                </li>
                                <li className="mb-2">
                                    <strong>Tên đăng nhập và vai trò:</strong> Không thể thay đổi
                                </li>
                            </ul>

                            <Alert variant="warning" className="mt-3">
                                <small>
                                    <strong>Lưu ý:</strong> Sau khi cập nhật email, bạn sẽ cần sử dụng email mới để đăng nhập.
                                </small>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminProfilePage; 