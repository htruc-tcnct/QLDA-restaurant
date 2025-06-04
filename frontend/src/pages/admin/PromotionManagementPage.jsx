import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaTags, FaPlus, FaEdit, FaTrashAlt, FaToggleOn, FaToggleOff, FaSearch, FaFilter } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus
} from '../../services/promotionService';

const PromotionManagementPage = () => {
  // State for promotions list
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [filters, setFilters] = useState({
    isActive: '',
    type: '',
    dateStatus: '' // 'current' for currently valid dates, 'expired' for expired, 'upcoming' for upcoming
  });

  // State for promotion form modal
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('Tạo khuyến mãi mới');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    code: '',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    minSpend: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    isActive: true
  });
  const [currentPromotionId, setCurrentPromotionId] = useState(null);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  // Load promotions on component mount and when filters or page changes
  useEffect(() => {
    fetchPromotions();
  }, [page, filters]);

  // Function to fetch promotions with current filters and pagination
  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filter out empty values from filters before sending to API
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('Current filters:', filters);
      console.log('Clean filters sent to API:', cleanFilters);

      const response = await getPromotions(page, 10, cleanFilters);
      console.log('Promotion response:', response); // Debug log

      if (response && response.data && Array.isArray(response.data.promotions)) {
        setPromotions(response.data.promotions);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error('Unexpected promotion data structure:', response);
        setPromotions([]);
        setError('Cấu trúc dữ liệu không đúng định dạng');
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.');
      setPromotions([]); // Reset danh sách để tránh hiển thị dữ liệu cũ
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle date changes
  const handleDateChange = (date, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: date
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name) {
      toast.error('Vui lòng nhập tên khuyến mãi');
      return;
    }

    if (!formData.value || formData.value <= 0) {
      toast.error('Vui lòng nhập giá trị khuyến mãi hợp lệ');
      return;
    }

    if (formData.endDate < formData.startDate) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    // Format data for API
    const promotionData = {
      ...formData,
      startDate: format(formData.startDate, 'yyyy-MM-dd'),
      endDate: format(formData.endDate, 'yyyy-MM-dd')
    };

    try {
      if (currentPromotionId) {
        // Update existing promotion
        await updatePromotion(currentPromotionId, promotionData);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        // Create new promotion
        await createPromotion(promotionData);
        toast.success('Tạo khuyến mãi mới thành công');
      }

      // Close modal and refresh list
      handleCloseModal();
      fetchPromotions();
    } catch (err) {
      console.error('Error saving promotion:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu khuyến mãi');
    }
  };

  // Open modal for creating a new promotion
  const handleOpenCreateModal = () => {
    setCurrentPromotionId(null);
    setModalTitle('Tạo khuyến mãi mới');
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      code: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      minSpend: 0,
      maxDiscountAmount: '',
      usageLimit: '',
      isActive: true
    });
    setShowModal(true);
  };

  // Open modal for editing an existing promotion
  const handleOpenEditModal = (promotion) => {
    setCurrentPromotionId(promotion._id);
    setModalTitle('Chỉnh sửa khuyến mãi');
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      value: promotion.value,
      code: promotion.code || '',
      startDate: new Date(promotion.startDate),
      endDate: new Date(promotion.endDate),
      minSpend: promotion.minSpend || 0,
      maxDiscountAmount: promotion.maxDiscountAmount || '',
      usageLimit: promotion.usageLimit || '',
      isActive: promotion.isActive
    });
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPromotionId(null);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (promotion) => {
    setPromotionToDelete(promotion);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPromotionToDelete(null);
  };

  // Handle promotion deletion
  const handleDeletePromotion = async () => {
    if (!promotionToDelete) return;

    try {
      await deletePromotion(promotionToDelete._id);
      toast.success('Xóa khuyến mãi thành công');
      handleCloseDeleteModal();
      fetchPromotions();
    } catch (err) {
      console.error('Error deleting promotion:', err);
      toast.error('Có lỗi xảy ra khi xóa khuyến mãi');
    }
  };

  // Handle promotion status toggle
  const handleToggleStatus = async (id) => {
    try {
      await togglePromotionStatus(id);
      toast.success('Cập nhật trạng thái thành công');
      fetchPromotions();
    } catch (err) {
      console.error('Error toggling promotion status:', err);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log('Filter change:', { name, value });
    console.log('Previous filters:', filters);

    const newFilters = {
      ...filters,
      [name]: value
    };

    console.log('New filters:', newFilters);
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  // Get promotion type display text
  const getPromotionTypeText = (type) => {
    switch (type) {
      case 'percentage':
        return 'Phần trăm';
      case 'fixed_amount':
        return 'Số tiền cố định';
      case 'free_shipping':
        return 'Miễn phí giao hàng';
      case 'buy_x_get_y':
        return 'Mua X tặng Y';
      default:
        return type;
    }
  };

  // Get promotion value display text
  const getPromotionValueText = (promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}%`;
      case 'fixed_amount':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(promotion.value);
      case 'free_shipping':
        return 'Miễn phí giao hàng';
      case 'buy_x_get_y':
        return `Mua ${promotion.value} tặng 1`;
      default:
        return promotion.value;
    }
  };

  // Get status badge color
  const getStatusBadge = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return <Badge bg="secondary">Không hoạt động</Badge>;
    }

    if (now < startDate) {
      return <Badge bg="info">Sắp diễn ra</Badge>;
    }

    if (now > endDate) {
      return <Badge bg="danger">Hết hạn</Badge>;
    }

    return <Badge bg="success">Đang hoạt động</Badge>;
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">
        <FaTags className="me-2" />
        Quản lý Khuyến mãi
      </h1>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaFilter className="me-1" /> Trạng thái kích hoạt
                  <small className="text-muted d-block">Được thiết lập bởi admin</small>
                </Form.Label>
                <Form.Select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả</option>
                  <option value="true">Đã kích hoạt</option>
                  <option value="false">Chưa kích hoạt</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label><FaFilter className="me-1" /> Loại khuyến mãi</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả loại</option>
                  <option value="percentage">Phần trăm</option>
                  <option value="fixed_amount">Số tiền cố định</option>
                  <option value="free_shipping">Miễn phí giao hàng</option>
                  <option value="buy_x_get_y">Mua X tặng Y</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaFilter className="me-1" /> Thời gian hiệu lực
                  <small className="text-muted d-block">Dựa trên ngày hiện tại</small>
                </Form.Label>
                <Form.Select
                  name="dateStatus"
                  value={filters.dateStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả</option>
                  <option value="current">🟢 Đang có hiệu lực</option>
                  <option value="upcoming">🔵 Sắp diễn ra</option>
                  <option value="expired">🔴 Đã hết hạn</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="primary"
                className="w-100 mb-3"
                onClick={handleOpenCreateModal}
              >
                <FaPlus className="me-2" /> Tạo Khuyến mãi mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Promotions List */}
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải danh sách khuyến mãi...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : promotions.length === 0 ? (
            <Alert variant="info">
              Không tìm thấy khuyến mãi nào. Hãy tạo khuyến mãi mới hoặc thay đổi bộ lọc.
            </Alert>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mã KM</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Ngày BĐ - KT</th>
                  <th>Trạng thái</th>
                  <th>Lượt sử dụng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion._id}>
                    <td>{promotion.name}</td>
                    <td>{promotion.code || <em>Không có</em>}</td>
                    <td>{getPromotionTypeText(promotion.type)}</td>
                    <td>{getPromotionValueText(promotion)}</td>
                    <td>
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </td>
                    <td>{getStatusBadge(promotion)}</td>
                    <td>
                      {promotion.usageCount || 0}
                      {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenEditModal(promotion)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(promotion)}
                        >
                          <FaTrashAlt />
                        </Button>
                        <Button
                          variant={promotion.isActive ? "outline-secondary" : "outline-success"}
                          size="sm"
                          onClick={() => handleToggleStatus(promotion._id)}
                          title={promotion.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {promotion.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="me-2"
              >
                Trang trước
              </Button>
              <span className="mx-3 d-flex align-items-center">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline-primary"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Trang sau
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Promotion Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên khuyến mãi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã khuyến mãi (tùy chọn)</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="VD: SUMMER2023"
                  />
                  <Form.Text className="text-muted">
                    Để trống nếu là khuyến mãi tự động không cần nhập mã
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại khuyến mãi *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (VND)</option>
                    <option value="free_shipping">Miễn phí giao hàng</option>
                    <option value="buy_x_get_y">Mua X tặng Y</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị *</Form.Label>
                  <Form.Control
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder={formData.type === 'percentage' ? "VD: 10 (cho 10%)" : "VD: 50000"}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị đơn hàng tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minSpend"
                    value={formData.minSpend}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu *</Form.Label>
                  <br />
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date) => handleDateChange(date, 'startDate')}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc *</Form.Label>
                  <br />
                  <DatePicker
                    selected={formData.endDate}
                    onChange={(date) => handleDateChange(date, 'endDate')}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    minDate={formData.startDate}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới hạn sử dụng (tùy chọn)</Form.Label>
                  <Form.Control
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Để trống nếu không giới hạn"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                {formData.type === 'percentage' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Giảm tối đa (tùy chọn)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Giới hạn số tiền giảm tối đa"
                    />
                  </Form.Group>
                )}
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Khuyến mãi đang hoạt động"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {currentPromotionId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa khuyến mãi "{promotionToDelete?.name}"?</p>
          <p className="text-danger">Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeletePromotion}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PromotionManagementPage; 