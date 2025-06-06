import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import promotionService from '../../services/promotionService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PromotionManagementPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    applicableFor: 'all'
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getAllPromotions();
      setPromotions(response.data.data.promotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (promotion = null) => {
    if (promotion) {
      // Editing existing promotion
      setCurrentPromotion(promotion);
      setFormData({
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minOrderValue: promotion.minOrderValue || 0,
        maxDiscountAmount: promotion.maxDiscountAmount || '',
        startDate: format(new Date(promotion.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(promotion.endDate), 'yyyy-MM-dd'),
        usageLimit: promotion.usageLimit || '',
        applicableFor: promotion.applicableFor || 'all',
        isActive: promotion.isActive
      });
    } else {
      // Creating new promotion
      setCurrentPromotion(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // +30 days
        usageLimit: '',
        applicableFor: 'all',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPromotion(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const promotionData = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
      };

      if (currentPromotion) {
        // Update existing promotion
        await promotionService.updatePromotion(currentPromotion._id, promotionData);
        toast.success('Cập nhật mã khuyến mãi thành công');
      } else {
        // Create new promotion
        await promotionService.createPromotion(promotionData);
        toast.success('Tạo mã khuyến mãi thành công');
      }
      
      handleCloseModal();
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu mã khuyến mãi');
    }
  };

  const handleDeletePromotion = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      try {
        await promotionService.deletePromotion(id);
        toast.success('Xóa mã khuyến mãi thành công');
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        toast.error('Không thể xóa mã khuyến mãi');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const isPromotionActive = (promotion) => {
    const now = new Date();
    return (
      promotion.isActive &&
      now >= new Date(promotion.startDate) &&
      now <= new Date(promotion.endDate) &&
      (promotion.usageLimit === null || promotion.usageCount < promotion.usageLimit)
    );
  };

  return (
    <Container fluid className="promotion-management-page py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Quản lý khuyến mãi</h2>
          <p className="text-muted">Tạo và quản lý các mã khuyến mãi</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <FaPlus className="me-2" /> Tạo mã khuyến mãi
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2">Đang tải danh sách khuyến mãi...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-4">
              <p>Chưa có mã khuyến mãi nào.</p>
              <Button variant="outline-primary" onClick={() => handleShowModal()}>
                Tạo mã khuyến mãi đầu tiên
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Giảm giá</th>
                  <th>Thời gian</th>
                  <th>Giới hạn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion._id}>
                    <td>
                      <strong>{promotion.code}</strong>
                    </td>
                    <td>{promotion.description}</td>
                    <td>
                      {promotion.discountType === 'percentage'
                        ? `${promotion.discountValue}%`
                        : `${(promotion.discountValue || 0).toLocaleString('vi-VN')}đ`}
                      {promotion.minOrderValue > 0 && (
                        <div className="small text-muted">
                          Đơn tối thiểu: {(promotion.minOrderValue || 0).toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{formatDate(promotion.startDate)}</div>
                      <div>{formatDate(promotion.endDate)}</div>
                    </td>
                    <td>
                      {promotion.usageLimit ? (
                        <span>
                          {promotion.usageCount}/{promotion.usageLimit}
                        </span>
                      ) : (
                        <span>Không giới hạn</span>
                      )}
                    </td>
                    <td>
                      {isPromotionActive(promotion) ? (
                        <Badge bg="success">Đang hoạt động</Badge>
                      ) : !promotion.isActive ? (
                        <Badge bg="secondary">Đã tắt</Badge>
                      ) : new Date() < new Date(promotion.startDate) ? (
                        <Badge bg="info">Chưa bắt đầu</Badge>
                      ) : new Date() > new Date(promotion.endDate) ? (
                        <Badge bg="danger">Đã hết hạn</Badge>
                      ) : promotion.usageLimit && promotion.usageCount >= promotion.usageLimit ? (
                        <Badge bg="warning">Đã hết lượt</Badge>
                      ) : (
                        <Badge bg="secondary">Không hoạt động</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(promotion)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeletePromotion(promotion._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal for creating/editing promotions */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentPromotion ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã khuyến mãi</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: SUMMER2023"
                  />
                  <Form.Text className="text-muted">
                    Mã sẽ được chuyển thành chữ hoa tự động
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá</Form.Label>
                  <Form.Select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {formData.discountType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step={formData.discountType === 'percentage' ? '1' : '1000'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị đơn hàng tối thiểu (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                  />
                </Form.Group>
              </Col>
            </Row>

            {formData.discountType === 'percentage' && (
              <Form.Group className="mb-3">
                <Form.Label>Giảm tối đa (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  placeholder="Để trống nếu không giới hạn"
                />
                <Form.Text className="text-muted">
                  Giới hạn số tiền giảm tối đa khi sử dụng phần trăm
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={2}
                placeholder="Mô tả ngắn về khuyến mãi"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới hạn sử dụng</Form.Label>
                  <Form.Control
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Để trống nếu không giới hạn"
                  />
                  <Form.Text className="text-muted">
                    Số lần mã có thể được sử dụng
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Áp dụng cho</Form.Label>
                  <Form.Select
                    name="applicableFor"
                    value={formData.applicableFor}
                    onChange={handleInputChange}
                  >
                    <option value="all">Tất cả khách hàng</option>
                    <option value="new_users">Khách hàng mới</option>
                    <option value="existing_users">Khách hàng hiện tại</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {currentPromotion && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Kích hoạt mã khuyến mãi"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {currentPromotion ? 'Cập nhật' : 'Tạo mã'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PromotionManagementPage; 