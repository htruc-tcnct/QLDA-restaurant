import React, { useState } from 'react';
import { Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FaTag, FaCheck, FaTimes } from 'react-icons/fa';
import promotionService from '../services/promotionService';

/**
 * Component nhập mã khuyến mãi
 * @param {Object} props
 * @param {number} props.orderTotal - Tổng giá trị đơn hàng
 * @param {Function} props.onApplyPromo - Callback khi áp dụng mã thành công, truyền vào thông tin khuyến mãi và số tiền giảm
 * @param {Function} props.onRemovePromo - Callback khi xóa mã khuyến mãi
 */
const PromoCodeInput = ({ orderTotal, onApplyPromo, onRemovePromo }) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleInputChange = (e) => {
    setPromoCode(e.target.value.toUpperCase());
    setError('');
  };

  const validatePromoCode = async () => {
    if (!promoCode) {
      setError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await promotionService.validatePromotion(promoCode, orderTotal);
      const { promotion, discountAmount } = response.data.data;

      setAppliedPromo(promotion);
      setDiscountAmount(discountAmount);

      // Gọi callback để cập nhật giá trị giảm giá trong component cha
      if (onApplyPromo) {
        onApplyPromo(promotion, discountAmount);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setError(error.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setDiscountAmount(0);
    setError('');

    // Gọi callback để xóa giảm giá trong component cha
    if (onRemovePromo) {
      onRemovePromo();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="promo-code-input mb-3">
      <Form.Label>Mã khuyến mãi</Form.Label>
      <InputGroup>
        <InputGroup.Text>
          <FaTag />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Nhập mã khuyến mãi"
          value={promoCode}
          onChange={handleInputChange}
          disabled={loading || appliedPromo}
        />
        {!appliedPromo ? (
          <Button
            variant="outline-primary"
            onClick={validatePromoCode}
            disabled={loading || !promoCode}
          >
            {loading ? <Spinner size="sm" animation="border" /> : 'Áp dụng'}
          </Button>
        ) : (
          <Button variant="outline-danger" onClick={removePromoCode}>
            <FaTimes />
          </Button>
        )}
      </InputGroup>

      {error && <Alert variant="danger" className="mt-2 py-2 small">{error}</Alert>}

      {appliedPromo && (
        <Alert variant="success" className="mt-2 py-2">
          <div className="d-flex align-items-center">
            <FaCheck className="me-2" />
            <div>
              <strong>Đã áp dụng: {appliedPromo.code}</strong>
              <div className="small">{appliedPromo.description}</div>
              <div className="mt-1">
                <strong>Giảm: {formatCurrency(discountAmount)}</strong>
              </div>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default PromoCodeInput; 