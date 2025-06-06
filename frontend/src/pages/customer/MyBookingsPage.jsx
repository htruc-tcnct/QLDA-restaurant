import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaListAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaInfoCircle,
  FaCheckCircle,
  FaBan,
  FaClipboardCheck,
  FaUserSlash,
} from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import api from "../../services/api";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/format";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);
  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/bookings/my-bookings");
      setBookings(response.data.data.bookings);
      setError("");
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      setCancellingBooking(true);
      await api.put(
        `/api/bookings/${selectedBooking._id}/cancel-by-customer`
      );

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "cancelled_by_customer" }
            : booking
        )
      );

      toast.success("Đã hủy đặt bàn thành công");
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error(
        err.response?.data?.message ||
        "Không thể hủy đặt bàn. Vui lòng thử lại sau."
      );
    } finally {
      setCancellingBooking(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_confirmation":
        return (
          <Badge bg="warning" text="dark">
            <FaInfoCircle className="me-1" /> Chờ xác nhận
          </Badge>
        );
      case "confirmed":
        return (
          <Badge bg="success">
            <FaCheckCircle className="me-1" /> Đã xác nhận
          </Badge>
        );
      case "cancelled_by_customer":
        return (
          <Badge bg="danger">
            <FaTimesCircle className="me-1" /> Đã hủy bởi khách
          </Badge>
        );
      case "cancelled_by_restaurant":
        return (
          <Badge bg="danger">
            <FaBan className="me-1" /> Đã hủy bởi nhà hàng
          </Badge>
        );
      case "completed":
        return (
          <Badge bg="info">
            <FaClipboardCheck className="me-1" /> Hoàn thành
          </Badge>
        );
      case "no_show":
        return (
          <Badge bg="secondary">
            <FaUserSlash className="me-1" /> Vắng mặt
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const canCancelBooking = (booking) => {
    // Only allow cancellation if status is pending or confirmed
    if (!["pending", "confirmed"].includes(booking.status)) {
      return false;
    }

    // Check if booking is at least 2 hours in the future
    const bookingDate = new Date(
      `${booking.date.split("T")[0]}T${booking.time}`
    );
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);

    return hoursDifference >= 2;
  };

  const formatBookingDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="py-5">
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center mb-4">
              <FaListAlt className="me-2" />
              Đặt Bàn Của Tôi
            </h1>
            <p className="text-center text-muted">
              Quản lý tất cả các đặt bàn của bạn tại đây
            </p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tải danh sách đặt bàn...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaCalendarAlt size={50} className="text-muted mb-3" />
              <h4>Bạn chưa có đặt bàn nào</h4>
              <p className="text-muted">
                Hãy đặt bàn để trải nghiệm dịch vụ tuyệt vời của chúng tôi
              </p>
              <Button variant="primary" href="/booking">
                Đặt Bàn Ngay
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {bookings.map((booking) => (
              <Col key={booking._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Đặt bàn #{booking._id.substr(-6)}</h5>
                    {getStatusBadge(booking.status)}
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendarAlt className="text-primary me-2" />
                        <strong>Ngày:</strong>
                        <span className="ms-2">
                          {formatBookingDate(booking.date)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaClock className="text-primary me-2" />
                        <strong>Giờ:</strong>
                        <span className="ms-2">{booking.time}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaUsers className="text-primary me-2" />
                        <strong>Số khách:</strong>
                        <span className="ms-2">
                          {booking.numberOfGuests} người
                        </span>
                      </div>

                      {booking.tableAssigned && (
                        <div className="d-flex align-items-center mt-2">
                          <FaCheckCircle className="text-success me-2" />
                          <strong>Bàn đã gán:</strong>
                          <span className="ms-2">
                            {booking.tableAssigned.name}
                            {booking.tableAssigned.capacity && (
                              <small className="text-muted ms-1">
                                (Sức chứa: {booking.tableAssigned.capacity}{" "}
                                người)
                              </small>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div className="mb-3">
                        <strong>Ghi chú:</strong>
                        <p className="text-muted mb-0">{booking.notes}</p>
                      </div>
                    )}

                    {booking.preOrderedItems &&
                      booking.preOrderedItems.length > 0 && (
                        <div className="mb-3">
                          <strong>Món đã đặt trước:</strong>
                          <ul className="list-unstyled ps-3 mb-0">
                            {booking.preOrderedItems.map((item, index) => (
                              <li key={index}>
                                {item.menuItem.name} x{item.quantity}
                                {item.notes && (
                                  <small className="text-muted d-block">
                                    {item.notes}
                                  </small>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Promotion Info */}
                    {booking.appliedPromotion && (
                      <div className="mb-3">
                        <strong>Khuyến mãi:</strong>
                        <div className="alert alert-info py-2 mb-0 mt-1">
                          <small>
                            🎫 <strong>{booking.appliedPromotion.name}</strong>
                            <br />
                            Mã: {booking.appliedPromotion.code} | Giảm:{" "}
                            {formatCurrency(
                              booking.appliedPromotion.discountAmount
                            )}
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    {booking.paymentInfo && (
                      <div className="mb-3">
                        <strong>Thông tin thanh toán:</strong>
                        <div className="border rounded p-2 mt-1">
                          <div className="d-flex justify-content-between">
                            <small>Tạm tính:</small>
                            <small>
                              {formatCurrency(booking.paymentInfo.subtotal)}
                            </small>
                          </div>
                          {booking.paymentInfo.discountAmount > 0 && (
                            <div className="d-flex justify-content-between text-success">
                              <small>Giảm giá:</small>
                              <small>
                                -
                                {formatCurrency(
                                  booking.paymentInfo.discountAmount
                                )}
                              </small>
                            </div>
                          )}
                          <hr className="my-1" />
                          <div className="d-flex justify-content-between fw-bold">
                            <small>Tổng cộng:</small>
                            <small className="text-primary">
                              {formatCurrency(booking.paymentInfo.totalAmount)}
                            </small>
                          </div>
                          <div className="mt-1">
                            <small className="text-muted">
                              Phương thức:{" "}
                              {booking.paymentInfo.paymentMethod === "cash"
                                ? "Tiền mặt"
                                : booking.paymentInfo.paymentMethod === "card"
                                  ? "Thẻ"
                                  : booking.paymentInfo.paymentMethod ===
                                    "transfer"
                                    ? "Chuyển khoản"
                                    : booking.paymentInfo.paymentMethod ===
                                      "ewallet"
                                      ? "Ví điện tử"
                                      : booking.paymentInfo.paymentMethod}
                            </small>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer>
                    {canCancelBooking(booking) ? (
                      <Button
                        variant="outline-danger"
                        className="w-100"
                        onClick={() => openCancelModal(booking)}
                      >
                        <FaTimesCircle className="me-2" />
                        Hủy Đặt Bàn
                      </Button>
                    ) : (
                      <div className="text-center text-muted small">
                        {[
                          "cancelled_by_customer",
                          "cancelled_by_restaurant",
                        ].includes(booking.status)
                          ? "Đặt bàn đã bị hủy"
                          : ["completed", "no_show"].includes(booking.status)
                            ? "Đặt bàn đã hoàn thành"
                            : "Không thể hủy (dưới 2 giờ trước giờ đặt)"}
                      </div>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Cancel Booking Confirmation Modal */}
        <Modal
          show={showCancelModal}
          onHide={() => setShowCancelModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận hủy đặt bàn</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <>
                <p>Bạn có chắc chắn muốn hủy đặt bàn này không?</p>
                <ul className="mb-0">
                  <li>
                    <strong>Ngày:</strong>{" "}
                    {formatBookingDate(selectedBooking.date)}
                  </li>
                  <li>
                    <strong>Giờ:</strong> {selectedBooking.time}
                  </li>
                  <li>
                    <strong>Số khách:</strong> {selectedBooking.numberOfGuests}{" "}
                    người
                  </li>
                </ul>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={cancellingBooking}
            >
              Đóng
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelBooking}
              disabled={cancellingBooking}
            >
              {cancellingBooking ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang hủy...
                </>
              ) : (
                <>
                  <FaTimesCircle className="me-2" />
                  Xác nhận hủy
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyBookingsPage;
