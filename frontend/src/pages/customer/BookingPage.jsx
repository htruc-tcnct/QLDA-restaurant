import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaCalendarCheck,
  FaUtensils,
  FaUsers,
  FaClock,
  FaHeart,
} from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";
import { formatCurrency } from "../../utils/format";
import { useNavigate } from "react-router-dom";

const BookingPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    date: new Date(),
    time: "",
    numberOfGuests: 2,
    notes: "",
    preOrderedItems: [],
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.fullName || "",
        customerPhone: user.phoneNumber || "",
        customerEmail: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch recommended menu items
  useEffect(() => {
    const fetchRecommendedItems = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/menu-items", {
          params: { available: true, chefRecommended: true, limit: 6 },
        });
        setRecommendedItems(response.data.menuItems || []);
      } catch (error) {
        console.error("Error fetching recommended items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedItems();
  }, []);

  // Fetch favorite menu items
  useEffect(() => {
    const fetchFavoriteItems = async () => {
      if (!isAuthenticated) return;

      try {
        setLoadingFavorites(true);
        const response = await api.get("/api/favorites");
        // The favorites data contains menuItem objects inside each favorite item
        const favoriteMenuItems = response.data.map((fav) => fav.menuItem);
        setFavoriteItems(favoriteMenuItems || []);
      } catch (error) {
        console.error("Error fetching favorite items:", error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavoriteItems();
  }, [isAuthenticated]);

  // Generate available time slots (this would ideally come from the backend)
  useEffect(() => {
    // Example: Restaurant open from 10:00 to 22:00, slots every 30 minutes
    const generateTimeSlots = () => {
      const slots = [];
      const now = new Date();
      const isToday = formData.date.toDateString() === now.toDateString();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      for (let hour = 10; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip times that have already passed today
          if (
            isToday &&
            (hour < currentHour ||
              (hour === currentHour && minute <= currentMinute))
          ) {
            continue;
          }

          const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          slots.push(timeString);
        }
      }

      setAvailableTimes(slots);
    };

    generateTimeSlots();
  }, [formData.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handlePreOrderToggle = (menuItemId) => {
    setFormData((prev) => {
      const existingItem = prev.preOrderedItems.find(
        (item) => item.menuItem === menuItemId
      );

      if (existingItem) {
        // Remove item if it exists
        return {
          ...prev,
          preOrderedItems: prev.preOrderedItems.filter(
            (item) => item.menuItem !== menuItemId
          ),
        };
      } else {
        // Add item with quantity 1
        return {
          ...prev,
          preOrderedItems: [
            ...prev.preOrderedItems,
            { menuItem: menuItemId, quantity: 1, notes: "" },
          ],
        };
      }
    });
  };

  const handlePreOrderQuantityChange = (menuItemId, quantity) => {
    setFormData((prev) => ({
      ...prev,
      preOrderedItems: prev.preOrderedItems.map((item) =>
        item.menuItem === menuItemId
          ? { ...item, quantity: parseInt(quantity) }
          : item
      ),
    }));
  };

  const handlePreOrderNotesChange = (menuItemId, notes) => {
    setFormData((prev) => ({
      ...prev,
      preOrderedItems: prev.preOrderedItems.map((item) =>
        item.menuItem === menuItemId ? { ...item, notes } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.time ||
      formData.numberOfGuests < 1
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/api/v1/bookings", formData);

      toast.success("Đặt bàn thành công! Chúng tôi sẽ liên hệ để xác nhận.");

      // Redirect to my bookings page if user is logged in
      if (isAuthenticated) {
        navigate("/my-bookings");
      } else {
        // Reset form if not logged in
        setFormData({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          date: new Date(),
          time: "",
          numberOfGuests: 2,
          notes: "",
          preOrderedItems: [],
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Filter menu items based on search term
  const filteredRecommendedItems = recommendedItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFavoriteItems = favoriteItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="py-5">
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center mb-4">
              <FaCalendarCheck className="me-2" />
              Đặt Bàn Trực Tuyến
            </h1>
            <p className="text-center text-muted">
              Đặt bàn trước để đảm bảo trải nghiệm ẩm thực tuyệt vời tại nhà
              hàng của chúng tôi.
            </p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col lg={7}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Thông Tin Đặt Bàn</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Họ và tên <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Số điện thoại <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Ngày <span className="text-danger">*</span>
                        </Form.Label>
                        <DatePicker
                          selected={formData.date}
                          onChange={handleDateChange}
                          minDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          className="form-control"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Số lượng khách <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="numberOfGuests"
                          value={formData.numberOfGuests}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      Giờ <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={
                            formData.time === time
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, time }))
                          }
                          className="time-slot-button"
                        >
                          <FaClock className="me-1" /> {time}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm, hoặc các ghi chú khác..."
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mt-3"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FaCalendarCheck className="me-2" />
                        Đặt Bàn
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0">
                  <FaUtensils className="me-2" />
                  Món Ăn Đề Xuất
                </h4>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải món ăn...</p>
                  </div>
                ) : recommendedItems.length === 0 ? (
                  <p className="text-center py-3">Không có món ăn đề xuất.</p>
                ) : (
                  <div>
                    <p className="text-muted mb-3">
                      Chọn món ăn bạn muốn đặt trước:
                    </p>

                    {/* Search bar for recommended items */}
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Tìm món ăn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </Form.Group>

                    {filteredRecommendedItems.map((item) => {
                      const isSelected = formData.preOrderedItems.some(
                        (orderItem) => orderItem.menuItem === item._id
                      );
                      const orderItem = formData.preOrderedItems.find(
                        (orderItem) => orderItem.menuItem === item._id
                      );

                      return (
                        <Card
                          key={item._id}
                          className={`mb-3 ${
                            isSelected ? "border-primary" : ""
                          }`}
                        >
                          <Row className="g-0">
                            <Col xs={4}>
                              <div
                                style={{ height: "100%", minHeight: "80px" }}
                              >
                                <img
                                  src={
                                    item.imageUrls?.[0] ||
                                    "https://via.placeholder.com/150?text=No+Image"
                                  }
                                  alt={item.name}
                                  className="img-fluid rounded-start"
                                  style={{ height: "100%", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/150?text=No+Image";
                                  }}
                                />
                              </div>
                            </Col>
                            <Col xs={8}>
                              <Card.Body className="py-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <Card.Title className="h6 mb-1">
                                    {item.name}
                                  </Card.Title>
                                  <div className="text-primary fw-bold">
                                    {formatCurrency(item.price)}
                                  </div>
                                </div>
                                <Card.Text className="small text-muted mb-2">
                                  {item.description?.substring(0, 60)}
                                  {item.description?.length > 60 ? "..." : ""}
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center">
                                  <Button
                                    variant={
                                      isSelected ? "primary" : "outline-primary"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      handlePreOrderToggle(item._id)
                                    }
                                  >
                                    {isSelected ? "Đã chọn" : "Chọn món"}
                                  </Button>

                                  {isSelected && (
                                    <Form.Control
                                      type="number"
                                      min="1"
                                      value={orderItem.quantity}
                                      onChange={(e) =>
                                        handlePreOrderQuantityChange(
                                          item._id,
                                          e.target.value
                                        )
                                      }
                                      style={{ width: "60px" }}
                                      size="sm"
                                    />
                                  )}
                                </div>

                                {isSelected && (
                                  <Form.Control
                                    type="text"
                                    placeholder="Ghi chú cho món này"
                                    value={orderItem.notes}
                                    onChange={(e) =>
                                      handlePreOrderNotesChange(
                                        item._id,
                                        e.target.value
                                      )
                                    }
                                    className="mt-2"
                                    size="sm"
                                  />
                                )}
                              </Card.Body>
                            </Col>
                          </Row>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>

            {isAuthenticated && (
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-danger text-white">
                  <h4 className="mb-0">
                    <FaHeart className="me-2" />
                    Món Ăn Yêu Thích Của Bạn
                  </h4>
                </Card.Header>
                <Card.Body>
                  {loadingFavorites ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="danger" />
                      <p className="mt-2">Đang tải món ăn yêu thích...</p>
                    </div>
                  ) : favoriteItems.length === 0 ? (
                    <p className="text-center py-3">
                      Bạn chưa có món ăn yêu thích nào.
                    </p>
                  ) : (
                    <div>
                      <p className="text-muted mb-3">
                        Chọn từ danh sách món ăn yêu thích của bạn:
                      </p>

                      {/* Search bar for favorite items */}
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Tìm món ăn yêu thích..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>

                      {filteredFavoriteItems.map((item) => {
                        const isSelected = formData.preOrderedItems.some(
                          (orderItem) => orderItem.menuItem === item._id
                        );
                        const orderItem = formData.preOrderedItems.find(
                          (orderItem) => orderItem.menuItem === item._id
                        );

                        return (
                          <Card
                            key={item._id}
                            className={`mb-3 ${
                              isSelected ? "border-primary" : ""
                            }`}
                          >
                            <Row className="g-0">
                              <Col xs={4}>
                                <div
                                  style={{ height: "100%", minHeight: "80px" }}
                                >
                                  <img
                                    src={
                                      item.imageUrls?.[0] ||
                                      "https://via.placeholder.com/150?text=No+Image"
                                    }
                                    alt={item.name}
                                    className="img-fluid rounded-start"
                                    style={{
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/150?text=No+Image";
                                    }}
                                  />
                                </div>
                              </Col>
                              <Col xs={8}>
                                <Card.Body className="py-2">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <Card.Title className="h6 mb-1">
                                      {item.name}
                                    </Card.Title>
                                    <div className="text-primary fw-bold">
                                      {formatCurrency(item.price)}
                                    </div>
                                  </div>
                                  <Card.Text className="small text-muted mb-2">
                                    {item.description?.substring(0, 60)}
                                    {item.description?.length > 60 ? "..." : ""}
                                  </Card.Text>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <Button
                                      variant={
                                        isSelected
                                          ? "primary"
                                          : "outline-primary"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        handlePreOrderToggle(item._id)
                                      }
                                    >
                                      {isSelected ? "Đã chọn" : "Chọn món"}
                                    </Button>

                                    {isSelected && (
                                      <Form.Control
                                        type="number"
                                        min="1"
                                        value={orderItem.quantity}
                                        onChange={(e) =>
                                          handlePreOrderQuantityChange(
                                            item._id,
                                            e.target.value
                                          )
                                        }
                                        style={{ width: "60px" }}
                                        size="sm"
                                      />
                                    )}
                                  </div>

                                  {isSelected && (
                                    <Form.Control
                                      type="text"
                                      placeholder="Ghi chú cho món này"
                                      value={orderItem.notes}
                                      onChange={(e) =>
                                        handlePreOrderNotesChange(
                                          item._id,
                                          e.target.value
                                        )
                                      }
                                      className="mt-2"
                                      size="sm"
                                    />
                                  )}
                                </Card.Body>
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            <Card className="shadow-sm">
              <Card.Header className="bg-info text-white">
                <h4 className="mb-0">
                  <FaUsers className="me-2" />
                  Thông Tin Đặt Bàn
                </h4>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Chính sách đặt bàn:</strong>
                </p>
                <ul>
                  <li>Đặt bàn được xác nhận khi nhà hàng gọi điện xác nhận.</li>
                  <li>
                    Vui lòng đến đúng giờ đã đặt. Nhà hàng giữ bàn trong vòng 15
                    phút.
                  </li>
                  <li>Có thể hủy đặt bàn trước 2 giờ so với giờ đã đặt.</li>
                  <li>
                    Đối với nhóm trên 10 người, vui lòng liên hệ trực tiếp qua
                    số điện thoại của nhà hàng.
                  </li>
                </ul>
                <p className="mb-0">
                  <strong>Liên hệ hỗ trợ:</strong> 0123 456 789
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookingPage;
