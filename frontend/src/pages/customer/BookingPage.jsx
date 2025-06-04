import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarCheck, FaUtensils, FaUsers, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    date: new Date(),
    time: '',
    numberOfGuests: 2,
    notes: '',
    preOrderedItems: []
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Promotion states
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionError, setPromotionError] = useState('');

  // Payment states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.fullName || '',
        customerPhone: user.phoneNumber || '',
        customerEmail: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch recommended menu items
  useEffect(() => {
    const fetchRecommendedItems = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/menu-items', {
          params: { available: true, chefRecommended: true, limit: 6 }
        });
        setRecommendedItems(response.data.menuItems || []);
      } catch (error) {
        console.error('Error fetching recommended items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedItems();
  }, []);

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
          if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
            continue;
          }

          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }

      setAvailableTimes(slots);
    };

    generateTimeSlots();
  }, [formData.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handlePreOrderToggle = (menuItemId) => {
    setFormData(prev => {
      const existingItem = prev.preOrderedItems.find(item => item.menuItem === menuItemId);

      if (existingItem) {
        // Remove item if it exists
        return {
          ...prev,
          preOrderedItems: prev.preOrderedItems.filter(item => item.menuItem !== menuItemId)
        };
      } else {
        // Add item with quantity 1
        return {
          ...prev,
          preOrderedItems: [
            ...prev.preOrderedItems,
            { menuItem: menuItemId, quantity: 1, notes: '' }
          ]
        };
      }
    });
  };

  const handlePreOrderQuantityChange = (menuItemId, quantity) => {
    setFormData(prev => ({
      ...prev,
      preOrderedItems: prev.preOrderedItems.map(item =>
        item.menuItem === menuItemId ? { ...item, quantity: parseInt(quantity) } : item
      )
    }));
  };

  const handlePreOrderNotesChange = (menuItemId, notes) => {
    setFormData(prev => ({
      ...prev,
      preOrderedItems: prev.preOrderedItems.map(item =>
        item.menuItem === menuItemId ? { ...item, notes } : item
      )
    }));
  };

  // Calculate total amount for pre-ordered items
  const calculateSubtotal = () => {
    return formData.preOrderedItems.reduce((total, item) => {
      const menuItem = recommendedItems.find(mi => mi._id === item.menuItem);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  // Calculate discount amount
  const calculateDiscount = (subtotal) => {
    if (!appliedPromotion) return 0;

    let discount = 0;
    if (appliedPromotion.type === 'percentage') {
      discount = subtotal * (appliedPromotion.value / 100);
      if (appliedPromotion.maxDiscountAmount && discount > appliedPromotion.maxDiscountAmount) {
        discount = appliedPromotion.maxDiscountAmount;
      }
    } else if (appliedPromotion.type === 'fixed_amount') {
      discount = Math.min(appliedPromotion.value, subtotal);
    }
    return discount;
  };

  // Apply promotion code
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) {
      setPromotionError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    const subtotal = calculateSubtotal();
    if (subtotal === 0) {
      setPromotionError('Vui lòng chọn món ăn trước khi áp dụng khuyến mãi');
      return;
    }

    setPromotionLoading(true);
    setPromotionError('');

    try {
      const response = await api.post('/api/v1/promotions/apply-code', {
        code: promotionCode,
        orderTotal: subtotal
      });

      setAppliedPromotion(response.data.data.promotion);
      toast.success(`Áp dụng mã khuyến mãi thành công! Giảm ${formatCurrency(response.data.data.discountAmount)}`);
    } catch (error) {
      setPromotionError(error.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
    } finally {
      setPromotionLoading(false);
    }
  };

  // Remove applied promotion
  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    setPromotionCode('');
    setPromotionError('');
    toast.info('Đã gỡ mã khuyến mãi');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.customerName || !formData.customerPhone || !formData.time || formData.numberOfGuests < 1) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Prepare booking data with promotion and payment info
      const bookingData = {
        ...formData,
        appliedPromotion: appliedPromotion ? {
          id: appliedPromotion._id,
          code: appliedPromotion.code,
          name: appliedPromotion.name,
          discountAmount: calculateDiscount(calculateSubtotal())
        } : null,
        paymentInfo: formData.preOrderedItems.length > 0 ? {
          subtotal: calculateSubtotal(),
          discountAmount: calculateDiscount(calculateSubtotal()),
          totalAmount: calculateSubtotal() - calculateDiscount(calculateSubtotal()),
          paymentMethod: paymentMethod,
          paymentStatus: 'pending'
        } : null
      };

      const response = await api.post('/api/v1/bookings', bookingData);

      toast.success('Đặt bàn thành công! Chúng tôi sẽ liên hệ để xác nhận.');

      // Redirect to my bookings page if user is logged in
      if (isAuthenticated) {
        navigate('/my-bookings');
      } else {
        // Reset form if not logged in
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          date: new Date(),
          time: '',
          numberOfGuests: 2,
          notes: '',
          preOrderedItems: []
        });
        setAppliedPromotion(null);
        setPromotionCode('');
        setShowPayment(false);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

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
              Đặt bàn trước để đảm bảo trải nghiệm ẩm thực tuyệt vời tại nhà hàng của chúng tôi.
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
                        <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
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
                        <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
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
                        <Form.Label>Ngày <span className="text-danger">*</span></Form.Label>
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
                        <Form.Label>Số lượng khách <span className="text-danger">*</span></Form.Label>
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
                    <Form.Label>Giờ <span className="text-danger">*</span></Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={formData.time === time ? "primary" : "outline-primary"}
                          onClick={() => setFormData(prev => ({ ...prev, time }))}
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
                        <Spinner animation="border" size="sm" className="me-2" />
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
                    <p className="text-muted mb-3">Chọn món ăn bạn muốn đặt trước:</p>
                    {recommendedItems.map((item) => {
                      const isSelected = formData.preOrderedItems.some(
                        (orderItem) => orderItem.menuItem === item._id
                      );
                      const orderItem = formData.preOrderedItems.find(
                        (orderItem) => orderItem.menuItem === item._id
                      );

                      return (
                        <Card key={item._id} className={`mb-3 ${isSelected ? 'border-primary' : ''}`}>
                          <Row className="g-0">
                            <Col xs={4}>
                              <div style={{ height: '100%', minHeight: '80px' }}>
                                <img
                                  src={item.imageUrls?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                                  alt={item.name}
                                  className="img-fluid rounded-start"
                                  style={{ height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                  }}
                                />
                              </div>
                            </Col>
                            <Col xs={8}>
                              <Card.Body className="py-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <Card.Title className="h6 mb-1">{item.name}</Card.Title>
                                  <div className="text-primary fw-bold">{formatCurrency(item.price)}</div>
                                </div>
                                <Card.Text className="small text-muted mb-2">
                                  {item.description?.substring(0, 60)}
                                  {item.description?.length > 60 ? '...' : ''}
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center">
                                  <Button
                                    variant={isSelected ? "primary" : "outline-primary"}
                                    size="sm"
                                    onClick={() => handlePreOrderToggle(item._id)}
                                  >
                                    {isSelected ? 'Đã chọn' : 'Chọn món'}
                                  </Button>

                                  {isSelected && (
                                    <Form.Control
                                      type="number"
                                      min="1"
                                      value={orderItem.quantity}
                                      onChange={(e) => handlePreOrderQuantityChange(item._id, e.target.value)}
                                      style={{ width: '60px' }}
                                      size="sm"
                                    />
                                  )}
                                </div>

                                {isSelected && (
                                  <Form.Control
                                    type="text"
                                    placeholder="Ghi chú cho món này"
                                    value={orderItem.notes}
                                    onChange={(e) => handlePreOrderNotesChange(item._id, e.target.value)}
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
                  <li>Vui lòng đến đúng giờ đã đặt. Nhà hàng giữ bàn trong vòng 15 phút.</li>
                  <li>Có thể hủy đặt bàn trước 2 giờ so với giờ đã đặt.</li>
                  <li>Đối với nhóm trên 10 người, vui lòng liên hệ trực tiếp qua số điện thoại của nhà hàng.</li>
                </ul>
                <p className="mb-0">
                  <strong>Liên hệ hỗ trợ:</strong> 0123 456 789
                </p>
              </Card.Body>
            </Card>

            {/* Order Summary & Payment Section */}
            {formData.preOrderedItems.length > 0 && (
              <Card className="shadow-sm mt-4">
                <Card.Header className="bg-warning text-dark">
                  <h4 className="mb-0">
                    💰 Tổng Kết & Thanh Toán
                  </h4>
                </Card.Header>
                <Card.Body>
                  {/* Promotion Code Section */}
                  <div className="mb-4">
                    <h6>🎫 Mã Khuyến Mãi</h6>
                    {appliedPromotion ? (
                      <div className="alert alert-success d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{appliedPromotion.name}</strong>
                          <br />
                          <small>Mã: {appliedPromotion.code}</small>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={handleRemovePromotion}
                        >
                          Gỡ
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="input-group mb-2">
                          <Form.Control
                            type="text"
                            placeholder="Nhập mã khuyến mãi"
                            value={promotionCode}
                            onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                            disabled={promotionLoading}
                          />
                          <Button
                            variant="primary"
                            onClick={handleApplyPromotion}
                            disabled={promotionLoading || !promotionCode.trim()}
                          >
                            {promotionLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              'Áp dụng'
                            )}
                          </Button>
                        </div>
                        {promotionError && (
                          <div className="text-danger small">{promotionError}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="mb-4">
                    <h6>📋 Tổng Kết Đơn Hàng</h6>
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tạm tính:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {appliedPromotion && (
                        <div className="d-flex justify-content-between mb-2 text-success">
                          <span>Giảm giá:</span>
                          <span>-{formatCurrency(calculateDiscount(calculateSubtotal()))}</span>
                        </div>
                      )}
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-primary">
                          {formatCurrency(calculateSubtotal() - calculateDiscount(calculateSubtotal()))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-3">
                    <h6>💳 Phương Thức Thanh Toán</h6>
                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Thanh toán tiền mặt khi đến</option>
                      <option value="card">Thẻ tín dụng/ghi nợ</option>
                      <option value="transfer">Chuyển khoản ngân hàng</option>
                      <option value="ewallet">Ví điện tử</option>
                    </Form.Select>
                  </div>

                  <div className="text-muted small">
                    * Bạn có thể thanh toán trước hoặc thanh toán khi đến nhà hàng
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookingPage; 