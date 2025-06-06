import { useState } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaPercentage, FaMoneyBillWave, FaCheck, FaTags } from 'react-icons/fa';
import { applyPromoCode } from '../../../services/promotionService';

const DiscountModal = ({ show, onHide, onApplyDiscount, subTotal, currentDiscount = 0 }) => {
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(currentDiscount > 0
    ? (currentDiscount / subTotal * 100).toFixed(0)
    : 0);
  const [discountAmount, setDiscountAmount] = useState(currentDiscount);

  // Promotion code states
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Handle discount type change
  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);

    // Reset promotion states when switching away from promotion_code
    if (type !== 'promotion_code') {
      setAppliedPromotion(null);
      setPromoError('');
      setPromoCode('');
    }

    if (type === 'percentage') {
      // Convert amount to percentage
      setDiscountValue(Math.min(((discountAmount / subTotal) * 100).toFixed(0), 100));
    } else if (type === 'amount') {
      // Convert percentage to amount
      setDiscountValue(Math.min((subTotal * (discountValue / 100)).toFixed(0), subTotal));
    } else if (type === 'promotion_code') {
      setDiscountValue(0);
      setDiscountAmount(0);
    }
  };

  // Handle discount value change
  const handleDiscountValueChange = (e) => {
    const value = parseFloat(e.target.value) || 0;

    if (discountType === 'percentage') {
      // Limit percentage to 100%
      const limitedValue = Math.min(value, 100);
      setDiscountValue(limitedValue);
      setDiscountAmount((subTotal * (limitedValue / 100)).toFixed(0));
    } else {
      // Limit amount to subtotal
      const limitedValue = Math.min(value, subTotal);
      setDiscountValue(limitedValue);
      setDiscountAmount(limitedValue);
    }
  };

  // Handle promotion code application
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const response = await applyPromoCode(promoCode.trim(), subTotal);

      if (response.status === 'success') {
        setAppliedPromotion(response.data.promotion);
        setDiscountAmount(response.data.discountAmount);
        setPromoError('');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoError(error.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
      setAppliedPromotion(null);
      setDiscountAmount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  // Handle discount submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (discountType === 'promotion_code') {
      if (!appliedPromotion) {
        setPromoError('Vui lòng áp dụng mã khuyến mãi trước khi xác nhận');
        return;
      }

      onApplyDiscount({
        discountPercentage: null,
        discountAmount: discountAmount,
        promotionCode: promoCode,
        appliedPromotion: appliedPromotion
      });
    } else if (discountType === 'percentage') {
      onApplyDiscount({
        discountPercentage: parseFloat(discountValue),
        discountAmount: null
      });
    } else {
      onApplyDiscount({
        discountPercentage: null,
        discountAmount: parseFloat(discountValue)
      });
    }

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Áp dụng giảm giá</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Chọn loại giảm giá</Form.Label>
              <Row>
                <Col xs={4}>
                  <Button
                    variant={discountType === 'percentage' ? 'primary' : 'outline-primary'}
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleDiscountTypeChange('percentage')}
                    type="button"
                  >
                    <FaPercentage className="me-2" /> Theo %
                  </Button>
                </Col>
                <Col xs={4}>
                  <Button
                    variant={discountType === 'amount' ? 'primary' : 'outline-primary'}
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleDiscountTypeChange('amount')}
                    type="button"
                  >
                    <FaMoneyBillWave className="me-2" /> Số tiền
                  </Button>
                </Col>
                <Col xs={4}>
                  <Button
                    variant={discountType === 'promotion_code' ? 'primary' : 'outline-primary'}
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleDiscountTypeChange('promotion_code')}
                    type="button"
                  >
                    <FaTags className="me-2" /> Mã KM
                  </Button>
                </Col>
              </Row>
            </Form.Group>

            {/* Manual discount input */}
            {(discountType === 'percentage' || discountType === 'amount') && (
              <Form.Group className="mb-3">
                <Form.Label>
                  {discountType === 'percentage' ? 'Phần trăm giảm giá' : 'Số tiền giảm giá'}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="0"
                    max={discountType === 'percentage' ? '100' : subTotal}
                    step={discountType === 'percentage' ? '1' : '1000'}
                    value={discountValue}
                    onChange={handleDiscountValueChange}
                  />
                  <InputGroup.Text>
                    {discountType === 'percentage' ? '%' : 'VND'}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            )}

            {/* Promotion code input */}
            {discountType === 'promotion_code' && (
              <Form.Group className="mb-3">
                <Form.Label>Mã khuyến mãi</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Nhập mã khuyến mãi..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={promoLoading}
                  />
                  <Button
                    variant="outline-primary"
                    onClick={handleApplyPromoCode}
                    disabled={promoLoading || !promoCode.trim()}
                  >
                    {promoLoading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      'Áp dụng'
                    )}
                  </Button>
                </InputGroup>

                {promoError && (
                  <Alert variant="danger" className="mt-2 mb-0">
                    {promoError}
                  </Alert>
                )}

                {appliedPromotion && (
                  <Alert variant="success" className="mt-2 mb-0">
                    <strong>✓ Đã áp dụng:</strong> {appliedPromotion.name}
                    <br />
                    <small>Loại: {appliedPromotion.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'} • Giá trị: {appliedPromotion.type === 'percentage' ? `${appliedPromotion.value}%` : formatPrice(appliedPromotion.value)}</small>
                  </Alert>
                )}
              </Form.Group>
            )}
          </div>

          <div className="discount-preview p-3 bg-light rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Tạm tính:</span>
              <span>{formatPrice(subTotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Giảm giá:</span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
            {appliedPromotion && (
              <div className="d-flex justify-content-between mb-2 text-info small">
                <span>Từ mã: {promoCode}</span>
                <span>{appliedPromotion.name}</span>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Sau giảm giá:</span>
              <span>{formatPrice(subTotal - discountAmount)}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="success" type="submit" className="d-flex align-items-center">
            <FaCheck className="me-2" /> Áp dụng
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DiscountModal; 