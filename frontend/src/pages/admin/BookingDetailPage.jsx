import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaUsers, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import bookingService from '../../services/bookingService';
import { toast } from 'react-toastify';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBookingById(id);
        setBooking(response.data.data.booking || response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Không thể tải thông tin đặt bàn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge bg="success">Đã xác nhận</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      case 'cancelled_by_customer':
        return <Badge bg="danger">Khách hàng đã hủy</Badge>;
      case 'completed':
        return <Badge bg="info">Hoàn thành</Badge>;
      case 'no-show':
        return <Badge bg="dark">Không đến</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await bookingService.updateBookingStatus(id, { status: 'confirmed' });
      setBooking(prev => ({ ...prev, status: 'confirmed' }));
      toast.success('Đã xác nhận đặt bàn thành công');
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Không thể xác nhận đặt bàn. Vui lòng thử lại.');
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.updateBookingStatus(id, { status: 'cancelled' });
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
      toast.success('Đã hủy đặt bàn thành công');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Không thể hủy đặt bàn. Vui lòng thử lại.');
    }
  };

  const goBack = () => {
    navigate('/admin/bookings');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-3">Đang tải thông tin đặt bàn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Có lỗi xảy ra!</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-between">
          <Button variant="outline-primary" onClick={goBack}>
            <FaArrowLeft className="me-2" /> Quay lại danh sách
          </Button>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading">Không tìm thấy thông tin!</h4>
        <p>Không tìm thấy thông tin đặt bàn với ID: {id}</p>
        <hr />
        <Button variant="outline-primary" onClick={goBack}>
          <FaArrowLeft className="me-2" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="booking-detail-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" className="me-3" onClick={goBack}>
            <FaArrowLeft />
          </Button>
          <h2 className="mb-0">Chi tiết đặt bàn</h2>
        </div>
        <div>
          <Badge 
            bg={
              booking.status === 'pending' ? 'warning' :
              booking.status === 'confirmed' ? 'success' :
              booking.status === 'cancelled' || booking.status === 'cancelled_by_customer' ? 'danger' :
              booking.status === 'completed' ? 'info' :
              booking.status === 'no-show' ? 'dark' : 'secondary'
            }
            className="fs-6 p-2"
          >
            {booking.status === 'pending' && 'Chờ xác nhận'}
            {booking.status === 'confirmed' && 'Đã xác nhận'}
            {booking.status === 'cancelled' && 'Đã hủy'}
            {booking.status === 'cancelled_by_customer' && 'Khách hàng đã hủy'}
            {booking.status === 'completed' && 'Hoàn thành'}
            {booking.status === 'no-show' && 'Không đến'}
            {!['pending', 'confirmed', 'cancelled', 'cancelled_by_customer', 'completed', 'no-show'].includes(booking.status) && booking.status}
          </Badge>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between">
          <h5 className="mb-0">Thông tin đặt bàn #{booking._id.substring(0, 8)}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Thông tin khách hàng</h5>
              <p>
                <strong>Tên khách hàng:</strong> {booking.customerName}
              </p>
              <p>
                <FaPhone className="me-2 text-secondary" />
                <strong>Số điện thoại:</strong> {booking.customerPhone}
              </p>
              {booking.customerEmail && (
                <p>
                  <FaEnvelope className="me-2 text-secondary" />
                  <strong>Email:</strong> {booking.customerEmail}
                </p>
              )}
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Thông tin đặt bàn</h5>
              <p>
                <FaCalendarAlt className="me-2 text-secondary" />
                <strong>Ngày:</strong> {formatDate(booking.date)}
              </p>
              <p>
                <strong>Giờ:</strong> {booking.time}
              </p>
              <p>
                <FaUsers className="me-2 text-secondary" />
                <strong>Số khách:</strong> {booking.numberOfGuests}
              </p>
              {booking.table && (
                <p>
                  <strong>Bàn:</strong> {booking.table.name || `Bàn #${booking.table.tableNumber}`}
                </p>
              )}
            </Col>
          </Row>

          {booking.notes && (
            <div className="mt-3">
              <h5>Ghi chú</h5>
              <p className="p-3 bg-light rounded">{booking.notes}</p>
            </div>
          )}

          {booking.preOrderedItems && booking.preOrderedItems.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3">
                <FaUtensils className="me-2" /> Món đã đặt trước
              </h5>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Tên món</th>
                    <th>Số lượng</th>
                    <th className="text-end">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.preOrderedItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.menuItem?.name || 'Món không xác định'}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">
                        {item.menuItem?.price
                          ? new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.menuItem.price * item.quantity)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            Đặt bàn vào: {new Date(booking.createdAt).toLocaleString('vi-VN')}
          </small>
        </Card.Footer>
      </Card>

      <div className="d-flex gap-2">
        {booking.status === 'pending' && (
          <>
            <Button variant="success" onClick={handleConfirmBooking}>Xác nhận đặt bàn</Button>
            <Button variant="danger" onClick={handleCancelBooking}>Hủy đặt bàn</Button>
          </>
        )}
        {booking.status === 'confirmed' && (
          <>
            <Button variant="info">Đánh dấu hoàn thành</Button>
            <Button variant="danger" onClick={handleCancelBooking}>Hủy đặt bàn</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingDetailPage; 