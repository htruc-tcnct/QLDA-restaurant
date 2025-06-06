import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaTags,
  FaFilter,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { toast } from "react-toastify";
import promotionService from "../../services/promotionService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const PromotionManagementPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [filters, setFilters] = useState({
    isActive: "",
    type: "",
    dateStatus: "", // 'current' for currently valid dates, 'expired' for expired, 'upcoming' for upcoming
  });
  // State for promotion form modal
  const [showModal, setShowModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [modalTitle, setModalTitle] = useState(""); // Added state for modal title
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    applicableFor: "all",
    isActive: true,
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
      const cleanFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      console.log("Current filters:", filters);
      console.log("Clean filters sent to API:", cleanFilters);
      const response = await promotionService.getAllPromotions();
      console.log("Promotion response:", response); // Debug log

      if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.promotions)
      ) {
        setPromotions(response.data.data.promotions);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error("Unexpected promotion data structure:", response);
        setPromotions([]);
        setError("Cấu trúc dữ liệu không đúng định dạng");
      }
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.");
      setPromotions([]); // Reset danh sách để tránh hiển thị dữ liệu cũ
    } finally {
      setLoading(false);
    }
  }; // <-- Add this closing brace and semicolon to properly close fetchPromotions

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
        maxDiscountAmount: promotion.maxDiscountAmount || "",
        startDate: format(new Date(promotion.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(promotion.endDate), "yyyy-MM-dd"),
        usageLimit: promotion.usageLimit || "",
        applicableFor: promotion.applicableFor || "all",
        isActive: promotion.isActive,
      });
    } else {
      // Creating new promotion
      setCurrentPromotion(null);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        ), // +30 days
        usageLimit: "",
        applicableFor: "all",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPromotion(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle date changes
  const handleDateChange = (date, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.code) {
      toast.error("Vui lòng nhập mã khuyến mãi");
      return;
    }

    if (!formData.description) {
      toast.error("Vui lòng nhập mô tả khuyến mãi");
      return;
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      toast.error("Vui lòng nhập giá trị khuyến mãi hợp lệ");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    // Format data for API
    const promotionData = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
    };

    try {
      if (currentPromotionId) {
        // Update existing promotion
        await promotionService.updatePromotion(
          currentPromotion._id,
          promotionData
        );
        toast.success("Cập nhật mã khuyến mãi thành công");
      } else {
        // Create new promotion
        await promotionService.createPromotion(promotionData);
        toast.success("Tạo mã khuyến mãi thành công");
      }

      // Close modal and refresh list
      handleCloseModal();
      fetchPromotions();
    } catch (err) {
      console.error("Error saving promotion:", err);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi lưu khuyến mãi"
      );
    }
  };

  // Open modal for creating a new promotion
  const handleOpenCreateModal = () => {
    setCurrentPromotionId(null);
    setModalTitle("Tạo khuyến mãi mới");
    setFormData({
      name: "",
      description: "",
      type: "percentage",
      value: "",
      code: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      minSpend: 0,
      maxDiscountAmount: "",
      usageLimit: "",
      isActive: true,
    });
    setShowModal(true);
  };

  // Open modal for editing an existing promotion
  const handleOpenEditModal = (promotion) => {
    setCurrentPromotionId(promotion._id);
    setModalTitle("Chỉnh sửa khuyến mãi");
    setFormData({
      name: promotion.name,
      description: promotion.description || "",
      type: promotion.type,
      value: promotion.value,
      code: promotion.code || "",
      startDate: new Date(promotion.startDate),
      endDate: new Date(promotion.endDate),
      minSpend: promotion.minSpend || 0,
      maxDiscountAmount: promotion.maxDiscountAmount || "",
      usageLimit: promotion.usageLimit || "",
      isActive: promotion.isActive,
    });
    setShowModal(true);
  };
  // Close modal and reset form
  const handleClosePromotionModal = () => {
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
      await promotionService.deletePromotion(promotionToDelete._id);
      toast.success("Xóa khuyến mãi thành công");
      handleCloseDeleteModal();
      fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
      toast.error("Có lỗi xảy ra khi xóa khuyến mãi");
    }
  };
  // Handle promotion status toggle
  const handleToggleStatus = async (id) => {
    try {
      // We need to use the updatePromotion service method instead
      const promotion = promotions.find((p) => p._id === id);
      if (!promotion) return;

      await promotionService.updatePromotion(id, {
        isActive: !promotion.isActive,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchPromotions();
    } catch (err) {
      console.error("Error toggling promotion status:", err);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log("Filter change:", { name, value });
    console.log("Previous filters:", filters);

    const newFilters = {
      ...filters,
      [name]: value,
    };

    console.log("New filters:", newFilters);
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  // Get promotion type display text
  const getPromotionTypeText = (type) => {
    switch (type) {
      case "percentage":
        return "Phần trăm";
      case "fixed_amount":
        return "Số tiền cố định";
      case "free_shipping":
        return "Miễn phí giao hàng";
      case "buy_x_get_y":
        return "Mua X tặng Y";
      default:
        return type;
    }
  };

  // Get promotion value display text
  const getPromotionValueText = (promotion) => {
    switch (promotion.type) {
      case "percentage":
        return `${promotion.value}%`;
      case "fixed_amount":
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(promotion.value);
      case "free_shipping":
        return "Miễn phí giao hàng";
      case "buy_x_get_y":
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

  // Helper function to check if promotion is currently active
  const isPromotionActive = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    return (
      promotion.isActive &&
      now >= startDate &&
      now <= endDate &&
      (!promotion.usageLimit || promotion.usageCount < promotion.usageLimit)
    );
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
                  <small className="text-muted d-block">
                    Được thiết lập bởi admin
                  </small>
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
                <Form.Label>
                  <FaFilter className="me-1" /> Loại khuyến mãi
                </Form.Label>
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
                  <small className="text-muted d-block">
                    Dựa trên ngày hiện tại
                  </small>
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
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2">Đang tải danh sách khuyến mãi...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-4">
              <p>Chưa có mã khuyến mãi nào.</p>
              <Button
                variant="outline-primary"
                onClick={() => handleShowModal()}
              >
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
                      {promotion.discountType === "percentage"
                        ? `${promotion.discountValue}%`
                        : `${(promotion.discountValue || 0).toLocaleString(
                          "vi-VN"
                        )}đ`}
                      {promotion.minOrderValue > 0 && (
                        <div className="small text-muted">
                          Đơn tối thiểu:{" "}
                          {(promotion.minOrderValue || 0).toLocaleString(
                            "vi-VN"
                          )}
                          đ
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
                      ) : promotion.usageLimit &&
                        promotion.usageCount >= promotion.usageLimit ? (
                        <Badge bg="warning">Đã hết lượt</Badge>
                      ) : (
                        <Badge bg="secondary">Không hoạt động</Badge>
                      )}
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
                          variant={
                            promotion.isActive
                              ? "outline-secondary"
                              : "outline-success"
                          }
                          size="sm"
                          onClick={() => handleToggleStatus(promotion._id)}
                          title={
                            promotion.isActive ? "Vô hiệu hóa" : "Kích hoạt"
                          }
                        >
                          {promotion.isActive ? (
                            <FaToggleOn />
                          ) : (
                            <FaToggleOff />
                          )}
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
      {/* Promotion Form Modal */}{" "}
      <Modal show={showModal} onHide={handleClosePromotionModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPromotion
              ? "Chỉnh sửa mã khuyến mãi"
              : "Tạo mã khuyến mãi mới"}
          </Modal.Title>
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
            </Row>

            <Row>
              <Col md={4}>
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
                    {formData.discountType === "percentage"
                      ? "Phần trăm giảm (%)"
                      : "Số tiền giảm (VNĐ)"}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step={formData.discountType === "percentage" ? "1" : "1000"}
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

            {formData.discountType === "percentage" && (
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
              {" "}
              <Button
                variant="secondary"
                onClick={handleClosePromotionModal}
                className="me-2"
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {currentPromotionId ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Modal.Body>
        </Form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xóa khuyến mãi "{promotionToDelete?.name}"?
          </p>
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
