import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaCog } from 'react-icons/fa';

const AdminSettingsPage = () => {
    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="bg-warning text-dark">
                            <h4 className="mb-0">
                                <FaCog className="me-2" />
                                Cài đặt hệ thống
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="info">
                                <h5>🚧 Trang cài đặt đang được phát triển</h5>
                                <p className="mb-0">
                                    Trang này sẽ chứa các cài đặt hệ thống như:
                                </p>
                                <ul className="mt-2">
                                    <li>Cài đặt thông tin nhà hàng</li>
                                    <li>Cấu hình thanh toán</li>
                                    <li>Cài đặt email</li>
                                    <li>Quản lý backup</li>
                                    <li>Cài đặt bảo mật</li>
                                </ul>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminSettingsPage; 