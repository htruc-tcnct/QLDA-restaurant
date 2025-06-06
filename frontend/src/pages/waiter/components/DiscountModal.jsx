import { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { FaPercentage, FaMoneyBillWave, FaCheck, FaTag, FaTimes, FaSearch } from 'react-icons/fa';
import promotionService from '../../../services/promotionService';

const DiscountModal = ({ show, onHide, onApplyDiscount, subTotal, currentDiscount = 0 }) => {
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual discount state
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(currentDiscount > 0 
    ? (currentDiscount / subTotal * 100).toFixed(0) 
    : 0);
  const [discountAmount, setDiscountAmount] = useState(currentDiscount);
  
  // Promotion code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoData, setPromoData] = useState(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  
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
    
    if (type === 'percentage') {
      // Convert amount to percentage
      setDiscountValue(Math.min(((discountAmount / subTotal) * 100).toFixed(0), 100));
    } else {
      // Convert percentage to amount
      setDiscountValue(Math.min((subTotal * (discountValue / 100)).toFixed(0), subTotal));
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
  
  // Handle promo code change
  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value.toUpperCase());
    setPromoError('');
    setPromoSuccess(false);
    setPromoData(null);
  };
  
  // Validate promo code
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess(false);
    
    try {
      const response = await promotionService.validatePromotion(promoCode, subTotal);
      const { promotion, discountAmount, discountedTotal } = response.data.data;
      
      setPromoData(promotion);
      setPromoDiscountAmount(discountAmount);
      setPromoSuccess(true);
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoError(
        error.response?.data?.message || 
        'Không thể kiểm tra mã giảm giá. Vui lòng thử lại.'
      );
      setPromoData(null);
    } finally {
      setPromoLoading(false);
    }
  };
  
  // Handle discount submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === 'manual') {
      if (discountType === 'percentage') {
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
    } else if (activeTab === 'promo' && promoData) {
      onApplyDiscount({
        discountPercentage: null,
        discountAmount: promoDiscountAmount,
        promoCode: promoCode,
        promoId: promoData._id
      });
      
      // Increase usage count
      try {
        promotionService.applyPromotion(promoCode);
      } catch (error) {
        console.error('Error applying promotion:', error);
      }
    }
    
    onHide();
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Áp dụng giảm giá</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="manual" title="Giảm giá thủ công">
              <div className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Chọn loại giảm giá</Form.Label>
                  <Row>
                    <Col xs={6}>
                      <Button 
                        variant={discountType === 'percentage' ? 'primary' : 'outline-primary'} 
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={() => handleDiscountTypeChange('percentage')}
                        type="button"
                      >
                        <FaPercentage className="me-2" /> Theo phần trăm
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button 
                        variant={discountType === 'amount' ? 'primary' : 'outline-primary'} 
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={() => handleDiscountTypeChange('amount')}
                        type="button"
                      >
                        <FaMoneyBillWave className="me-2" /> Theo số tiền
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
                
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
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Sau giảm giá:</span>
                  <span>{formatPrice(subTotal - discountAmount)}</span>
                </div>
              </div>
            </Tab>
            
            <Tab eventKey="promo" title="Mã giảm giá">
              <div className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Nhập mã giảm giá</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã giảm giá (VD: WELCOME10)"
                      value={promoCode}
                      onChange={handlePromoCodeChange}
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={handleValidatePromo}
                      disabled={promoLoading}
                    >
                      {promoLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaSearch />
                      )}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Nhập mã giảm giá và nhấn kiểm tra để áp dụng
                  </Form.Text>
                </Form.Group>
                
                {promoError && (
                  <Alert variant="danger" className="mb-3">
                    <FaTimes className="me-2" />
                    {promoError}
                  </Alert>
                )}
                
                {promoSuccess && promoData && (
                  <Alert variant="success" className="mb-3">
                    <FaCheck className="me-2" />
                    Mã giảm giá hợp lệ!
                    <div className="mt-2">
                      <strong>Mô tả:</strong> {promoData.description}
                    </div>
                    <div>
                      <strong>Giảm:</strong> {promoData.discountType === 'percentage' 
                        ? `${promoData.discountValue}%` 
                        : formatPrice(promoData.discountValue)}
                    </div>
                    {promoData.minOrderValue > 0 && (
                      <div>
                        <strong>Đơn tối thiểu:</strong> {formatPrice(promoData.minOrderValue)}
                      </div>
                    )}
                    {promoData.maxDiscountAmount && (
                      <div>
                        <strong>Giảm tối đa:</strong> {formatPrice(promoData.maxDiscountAmount)}
                      </div>
                    )}
                  </Alert>
                )}
              </div>
              
              {promoSuccess && promoData && (
                <div className="discount-preview p-3 bg-light rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subTotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Giảm giá ({promoCode}):</span>
                    <span>- {formatPrice(promoDiscountAmount)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Sau giảm giá:</span>
                    <span>{formatPrice(subTotal - promoDiscountAmount)}</span>
                  </div>
                </div>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button 
            variant="success" 
            type="submit" 
            className="d-flex align-items-center"
            disabled={(activeTab === 'promo' && !promoSuccess)}
          >
            <FaCheck className="me-2" /> Áp dụng
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DiscountModal; 