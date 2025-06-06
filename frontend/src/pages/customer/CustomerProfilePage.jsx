import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaSave, FaEdit, FaStar, FaCalendarAlt } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';

const CustomerProfilePage = () => {
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
            await userService.updateProfile({
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
            <Container className="py-5">
                <Alert variant="warning">
                    Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col lg={8} className="mx-auto">
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">
                                <FaUser className="me-2" />
                                Thông tin tài khoản
                            </h3>
                        </Card.Header>
                        <Card.Body className="p-4">
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
                                                Loại tài khoản
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value="Khách hàng"
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
                                            <Form.Label>
                                                <FaStar className="me-2" />
                                                Điểm tích lũy
                                            </Form.Label>
                                            <div>
                                                <Badge bg="warning" className="fs-6 px-3 py-2">
                                                    {user.loyaltyPoints || 0} điểm
                                                </Badge>
                                            </div>
                                            <Form.Text className="text-muted">
                                                Tích lũy điểm từ các đơn hàng để nhận ưu đãi
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaCalendarAlt className="me-2" />
                                                Ngày tham gia
                                            </Form.Label>
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
                                            <Form.Label>Trạng thái tài khoản</Form.Label>
                                            <div>
                                                <Badge bg={user.isActive ? 'success' : 'danger'} className="fs-6 px-3 py-2">
                                                    {user.isActive ? '✓ Hoạt động' : '✗ Bị vô hiệu hóa'}
                                                </Badge>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex gap-2 justify-content-end mt-4">
                                    {!isEditing ? (
                                        <Button
                                            variant="primary"
                                            onClick={() => setIsEditing(true)}
                                            size="lg"
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
                                                size="lg"
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                variant="success"
                                                type="submit"
                                                disabled={isLoading}
                                                size="lg"
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
            </Row>

            <Row className="mt-4">
                <Col lg={8} className="mx-auto">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">💡 Mẹo sử dụng</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h6>🏆 Tích lũy điểm thưởng</h6>
                                    <ul className="list-unstyled">
                                        <li>• Mỗi 1.000đ = 1 điểm</li>
                                        <li>• 100 điểm = giảm 10.000đ</li>
                                        <li>• Sinh nhật x2 điểm</li>
                                    </ul>
                                </Col>
                                <Col md={6}>
                                    <h6>📧 Cập nhật thông tin</h6>
                                    <ul className="list-unstyled">
                                        <li>• Email để nhận thông báo khuyến mãi</li>
                                        <li>• SĐT để xác nhận đặt bàn</li>
                                        <li>• Thông tin chính xác giúp phục vụ tốt hơn</li>
                                    </ul>
                                </Col>
                            </Row>

                            <Alert variant="primary" className="mt-3 mb-0">
                                <small>
                                    <strong>Lưu ý:</strong> Thông tin của bạn được bảo mật và chỉ dùng để cải thiện trải nghiệm dịch vụ.
                                </small>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CustomerProfilePage; 