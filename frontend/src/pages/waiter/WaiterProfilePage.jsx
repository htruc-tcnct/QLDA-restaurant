import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaSave, FaEdit, FaIdBadge, FaClock } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';

const WaiterProfilePage = () => {
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

    const getRoleDisplayName = (role) => {
        const roleMap = {
            'admin': 'Quản trị viên',
            'manager': 'Quản lý',
            'chef': 'Đầu bếp',
            'staff': 'Nhân viên',
            'waiter': 'Phục vụ',
            'customer': 'Khách hàng'
        };
        return roleMap[role] || role;
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
                        <Card.Header className="bg-success text-white">
                            <h4 className="mb-0">
                                <FaIdBadge className="me-2" />
                                Thông tin nhân viên
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUser className="me-2" />
                                                Mã nhân viên
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={user.username}
                                                disabled
                                                className="bg-light"
                                            />
                                            <Form.Text className="text-muted">
                                                Mã nhân viên không thể thay đổi
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaUserTag className="me-2" />
                                                Chức vụ
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={getRoleDisplayName(user.role)}
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
                                            <Form.Label>Trạng thái làm việc</Form.Label>
                                            <div>
                                                <Badge bg={user.isActive ? 'success' : 'danger'} className="fs-6 px-3 py-2">
                                                    {user.isActive ? '✓ Đang làm việc' : '✗ Tạm nghỉ'}
                                                </Badge>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <FaClock className="me-2" />
                                                Ngày bắt đầu làm việc
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
                                            <Form.Label>Điểm hiệu suất</Form.Label>
                                            <div>
                                                <Badge bg="info" className="fs-6 px-3 py-2">
                                                    {user.loyaltyPoints || 0} điểm
                                                </Badge>
                                            </div>
                                            <Form.Text className="text-muted">
                                                Điểm đánh giá từ khách hàng và quản lý
                                            </Form.Text>
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
                            <h5 className="mb-0">📋 Thông tin công việc</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <h6>📱 Thông tin liên hệ</h6>
                                <ul className="list-unstyled">
                                    <li>• Cập nhật thông tin cá nhân để phục vụ tốt hơn</li>
                                    <li>• Email để nhận thông báo lịch làm việc</li>
                                    <li>• SĐT để liên hệ khẩn cấp</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <h6>⏰ Ca làm việc hôm nay</h6>
                                <div className="d-flex justify-content-between">
                                    <span>Ca sáng:</span>
                                    <Badge bg="primary">07:00 - 14:00</Badge>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span>Bàn phụ trách:</span>
                                    <Badge bg="secondary">Khu A (1-10)</Badge>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h6>📊 Hiệu suất tuần này</h6>
                                <div className="d-flex justify-content-between">
                                    <span>Đơn hàng phục vụ:</span>
                                    <Badge bg="success">23 đơn</Badge>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span>Đánh giá TB:</span>
                                    <Badge bg="warning">4.8/5⭐</Badge>
                                </div>
                            </div>

                            <Alert variant="success" className="mt-3">
                                <small>
                                    <strong>Chúc mừng!</strong> Bạn là nhân viên xuất sắc tháng này! 🏆
                                </small>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default WaiterProfilePage; 