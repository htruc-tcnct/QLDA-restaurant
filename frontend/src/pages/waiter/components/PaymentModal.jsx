import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, InputGroup } from 'react-bootstrap';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaMobileAlt, 
  FaQrcode,
  FaCheck
} from 'react-icons/fa';

const PaymentModal = ({ show, onHide, onSubmit, orderItems, subTotal, taxAmount, discountAmount, totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  
  // Update cash amount and change when total changes
  useEffect(() => {
    if (show) {
      setCashAmount(Math.ceil(totalAmount / 1000) * 1000); // Round up to nearest 1000 VND
      calculateChange(Math.ceil(totalAmount / 1000) * 1000);
    }
  }, [totalAmount, show]);
  
  // Calculate change amount
  const calculateChange = (amount) => {
    const change = amount - totalAmount;
    setChangeAmount(change > 0 ? change : 0);
  };
  
  // Handle cash amount change
  const handleCashAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setCashAmount(amount);
    calculateChange(amount);
  };
  
  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };
  
  // Handle payment submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({
      paymentMethod,
      cashAmount: paymentMethod === 'cash' ? cashAmount : null,
      changeAmount: paymentMethod === 'cash' ? changeAmount : null
    });
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Thanh toán</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={7}>
              <h5 className="mb-3">Chi tiết hóa đơn</h5>
              <div className="bill-container border rounded p-3 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Món</th>
                      <th style={{ width: '60px' }}>SL</th>
                      <th style={{ width: '100px' }}>Đơn giá</th>
                      <th style={{ width: '120px' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          {item.name}
                          {item.notes && (
                            <div className="small text-muted">
                              <em>Ghi chú: {item.notes}</em>
                            </div>
                          )}
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatPrice(item.price)}</td>
                        <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <div className="payment-summary mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Giảm giá:</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Thuế (10%):</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-0 fw-bold fs-5">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </Col>
            
            <Col md={5}>
              <h5 className="mb-3">Phương thức thanh toán</h5>
              
              <div className="payment-methods mb-4">
                <div className="d-grid gap-2">
                  <Button 
                    variant={paymentMethod === 'cash' ? 'primary' : 'outline-primary'} 
                    className="text-start d-flex align-items-center"
                    onClick={() => setPaymentMethod('cash')}
                    type="button"
                  >
                    <FaMoneyBillWave className="me-2" /> Tiền mặt
                  </Button>
                  
                  <Button 
                    variant={paymentMethod === 'card' ? 'primary' : 'outline-primary'} 
                    className="text-start d-flex align-items-center"
                    onClick={() => setPaymentMethod('card')}
                    type="button"
                  >
                    <FaCreditCard className="me-2" /> Thẻ Visa/Mastercard
                  </Button>
                  
                  <Button 
                    variant={paymentMethod === 'bank_transfer' ? 'primary' : 'outline-primary'} 
                    className="text-start d-flex align-items-center"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    type="button"
                  >
                    <FaQrcode className="me-2" /> Chuyển khoản ngân hàng
                  </Button>
                  
                  <Button 
                    variant={paymentMethod === 'e_wallet' ? 'primary' : 'outline-primary'} 
                    className="text-start d-flex align-items-center"
                    onClick={() => setPaymentMethod('e_wallet')}
                    type="button"
                  >
                    <FaMobileAlt className="me-2" /> Ví MoMo/ZaloPay
                  </Button>
                </div>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="cash-payment-details">
                  <Form.Group className="mb-3">
                    <Form.Label>Số tiền khách đưa</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        min={totalAmount}
                        step="1000"
                        value={cashAmount}
                        onChange={handleCashAmountChange}
                      />
                      <InputGroup.Text>VND</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  <div className="change-amount p-3 bg-light rounded mb-3">
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Tiền thối lại:</span>
                      <span className="text-success">{formatPrice(changeAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="success" type="submit" className="d-flex align-items-center">
            <FaCheck className="me-2" /> Xác nhận thanh toán
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PaymentModal; 