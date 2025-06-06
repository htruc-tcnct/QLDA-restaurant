import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaCog } from 'react-icons/fa';

const WaiterSettingsPage = () => {
    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="bg-success text-white">
                            <h4 className="mb-0">
                                <FaCog className="me-2" />
                                Cài đặt nhân viên
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="info">
                                <h5>🚧 Trang cài đặt đang được phát triển</h5>
                                <p className="mb-0">
                                    Trang này sẽ chứa các cài đặt dành cho nhân viên phục vụ như:
                                </p>
                                <ul className="mt-2">
                                    <li>Cài đặt thông báo ca làm việc</li>
                                    <li>Tùy chỉnh giao diện POS</li>
                                    <li>Cài đặt báo cáo cá nhân</li>
                                    <li>Thông báo đơn hàng mới</li>
                                    <li>Cài đặt khác</li>
                                </ul>
                                <p className="mt-3 mb-0">
                                    <strong>Liên hệ quản lý:</strong> Để thay đổi thông tin ca làm việc, vui lòng liên hệ với quản lý.
                                </p>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default WaiterSettingsPage; 