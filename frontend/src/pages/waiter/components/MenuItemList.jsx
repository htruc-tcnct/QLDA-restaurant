import { Row, Col, Card, Button, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaPlusCircle, FaInfoCircle, FaStar, FaLeaf, FaFire } from 'react-icons/fa';
import { useState } from 'react';

const MenuItemList = ({ menuItems, loading, onAddItem }) => {
  // State để lưu trữ lỗi hình ảnh
  const [imageErrors, setImageErrors] = useState({});

  // Generate placeholder image URL if no image is available
  const getImageUrl = (item) => {
    if (imageErrors[item._id]) {
      return 'https://via.placeholder.com/150?text=No+Image';
    }
    
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    
    return 'https://via.placeholder.com/150?text=No+Image';
  };
  
  // Xử lý lỗi hình ảnh
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };
  
  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  // Rút gọn mô tả
  const truncateDescription = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  // Tooltip cho thông tin chi tiết
  const renderTooltip = (item) => (
    <Tooltip id={`tooltip-${item._id}`}>
      <div className="p-2">
        <h6>{item.name}</h6>
        {item.description && <p className="mb-1">{item.description}</p>}
        <div className="d-flex justify-content-between">
          <span>{formatPrice(item.price)}</span>
          {item.tags && item.tags.length > 0 && (
            <span>{item.tags.join(', ')}</span>
          )}
        </div>
      </div>
    </Tooltip>
  );
  
  return (
    <div className="menu-item-list">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải thực đơn...</p>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-5">
          <FaInfoCircle className="text-secondary mb-2" size={30} />
          <p>Không tìm thấy món ăn nào</p>
          <p className="text-muted">Vui lòng thử tìm kiếm khác hoặc chọn danh mục khác</p>
        </div>
      ) : (
        <div className="p-2">
          <Row className="g-2">
            {menuItems.map((item) => (
              <Col key={item._id || `item-${item.name}`} xs={6} sm={6} md={4} lg={4} xl={3}>
                <Card 
                  className="menu-item-card h-100 shadow-sm" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => onAddItem(item)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div 
                    className="menu-item-img-container"
                    style={{
                      height: '120px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={getImageUrl(item)} 
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={() => handleImageError(item._id)}
                    />
                    <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }}>
                      {item.chefRecommended && (
                        <Badge bg="danger">
                          <FaStar className="me-1" /> Đầu bếp
                        </Badge>
                      )}
                      {item.tags && item.tags.includes('vegetarian') && (
                        <Badge bg="success">
                          <FaLeaf className="me-1" /> Chay
                        </Badge>
                      )}
                      {item.tags && item.tags.includes('spicy') && (
                        <Badge bg="warning">
                          <FaFire className="me-1" /> Cay
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Card.Body className="p-2">
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip(item)}
                    >
                      <h6 className="menu-item-name mb-1" style={{ height: '40px', overflow: 'hidden' }}>
                        {item.name}
                      </h6>
                    </OverlayTrigger>
                    
                    {item.description && (
                      <p className="text-muted small mb-2" style={{ height: '32px', overflow: 'hidden' }}>
                        {truncateDescription(item.description)}
                      </p>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="menu-item-price fw-bold text-primary">
                        {formatPrice(item.price)}
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="add-btn rounded-circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItem(item);
                        }}
                      >
                        <FaPlusCircle />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default MenuItemList; 