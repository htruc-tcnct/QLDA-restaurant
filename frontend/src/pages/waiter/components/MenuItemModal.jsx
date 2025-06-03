import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

const MenuItemModal = ({ show, onHide, menuItem, onAddToOrder, existingItem }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Reset form when menuItem changes or modal opens
  useEffect(() => {
    if (menuItem) {
      if (existingItem) {
        setQuantity(existingItem.quantity || 1);
        setNotes(existingItem.notes || '');
      } else {
        setQuantity(1);
        setNotes('');
      }
    }
  }, [menuItem, existingItem, show]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!menuItem) return;
    
    onAddToOrder({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      notes,
      id: existingItem?.id
    });
    
    onHide();
  };
  
  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };
  
  // Generate placeholder image URL if no image is available
  const getImageUrl = (item) => {
    if (!item) return 'https://via.placeholder.com/300?text=No+Image';
    
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    return 'https://via.placeholder.com/300?text=No+Image';
  };
  
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {existingItem ? 'Cập nhật món' : 'Thêm món vào đơn hàng'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {menuItem && (
            <Row>
              <Col md={5}>
                <div className="menu-item-image mb-3">
                  <img 
                    src={getImageUrl(menuItem)} 
                    alt={menuItem.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="menu-item-info">
                  <h4>{menuItem.name}</h4>
                  <p className="text-muted">{menuItem.description}</p>
                  <h5 className="text-primary">{formatPrice(menuItem.price)}</h5>
                </div>
              </Col>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng</Form.Label>
                  <InputGroup>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <FaMinusCircle />
                    </Button>
                    <Form.Control
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      style={{ textAlign: 'center' }}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <FaPlusCircle />
                    </Button>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú đặc biệt</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Nhập ghi chú cho món ăn này (ví dụ: không cay, ít ngọt, v.v.)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Group>
                
                <div className="total-price-preview p-3 bg-light rounded mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Đơn giá:</span>
                    <span>{formatPrice(menuItem.price)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Số lượng:</span>
                    <span>{quantity}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Thành tiền:</span>
                    <span>{formatPrice(menuItem.price * quantity)}</span>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            {existingItem ? 'Cập nhật' : 'Thêm vào đơn hàng'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MenuItemModal; 