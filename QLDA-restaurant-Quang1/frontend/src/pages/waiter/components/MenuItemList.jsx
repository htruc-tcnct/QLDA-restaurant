import { Row, Col, Card, Button, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaPlusCircle, FaInfoCircle, FaStar, FaLeaf, FaFire } from 'react-icons/fa';
import { useState } from 'react';

const ALL_MENU_IMAGE_URLS = [
  '/images/menu/Bào Ngư Sốt Dầu Hào/pixabay_1255020_06.jpg',
  '/images/menu/Bào Ngư Sốt Dầu Hào/pixabay_2495964_02.jpg',
  '/images/menu/Bò Wagyu Nướng/pixabay_1648603_01.jpg',
  '/images/menu/Bò Wagyu Nướng/pixabay_3139641_04.jpg',
  '/images/menu/Bò Wagyu Nướng/pixabay_3640560_02.jpg',
  '/images/menu/Bồ Câu Quay Da Giòn/pixabay_1265174_04.jpg',
  '/images/menu/Bồ Câu Quay Da Giòn/pixabay_1508975_02.jpg',
  '/images/menu/Bồ Câu Quay Da Giòn/pixabay_1712626_01.jpg',
  '/images/menu/Chân Cua Hoàng Đế Hấp/pixabay_1532115_01.jpg',
  '/images/menu/Chân Cua Hoàng Đế Hấp/pixabay_614628_06.jpg',
  '/images/menu/Chả Giò Hải Sản Cao Cấp/pixabay_2186506_01.jpg',
  '/images/menu/Chả Giò Hải Sản Cao Cấp/pixabay_2186520_06.jpg',
  '/images/menu/Cá Song Hấp Xì Dầu/pixabay_1508984_04.jpg',
  '/images/menu/Cá Song Hấp Xì Dầu/pixabay_2147040_03.jpg',
  '/images/menu/Cá Tuyết Hấp Gừng Hành/pixabay_6902892_01.jpg',
  '/images/menu/Cá Tuyết Hấp Gừng Hành/pixabay_6902999_06.jpg',
  '/images/menu/Cơm Chiên Tôm Càng Vua/pixabay_2509046_06.jpg',
  '/images/menu/Cơm Chiên Tôm Càng Vua/pixabay_5312128_03.jpg',
  '/images/menu/Cơm Chiên Tôm Càng Vua/pixabay_967081_02.jpg',
  '/images/menu/Gỏi Hải Sản Cao Cấp/pixabay_2455281_02.jpg',
  '/images/menu/Gỏi Hải Sản Cao Cấp/pixabay_518032_01.jpg',
  '/images/menu/Gỏi Hải Sản Cao Cấp/pixabay_522483_04.jpg',
  '/images/menu/Heo Sữa Quay Da Giòn/pixabay_2480295_01.jpg',
  '/images/menu/Heo Sữa Quay Da Giòn/pixabay_852042_03.jpg',
  '/images/menu/Lẩu Nấm Thiên Nhiên Cao Cấp/pixabay_2426889_06.jpg',
  '/images/menu/Lẩu Nấm Thiên Nhiên Cao Cấp/pixabay_2426891_02.jpg',
  '/images/menu/Lẩu Nấm Thiên Nhiên Cao Cấp/pixabay_6764962_04.jpg',
  '/images/menu/pan-seared_foie_gras_with_berry_sauce/pixabay_2210465_02.jpg',
  '/images/menu/pan-seared_foie_gras_with_berry_sauce/pixabay_4977312_04.jpg',
  '/images/menu/pan-seared_foie_gras_with_berry_sauce/pixabay_4977313_03.jpg',
  '/images/menu/stir-fried_glass_noodles_with_crab/pixabay_6405452_02.jpg',
  '/images/menu/stir-fried_glass_noodles_with_crab/pixabay_906248_07.jpg',
  '/images/menu/Sườn Cừu Nướng Lá Hương Thảo/pixabay_1095653_03.jpg',
  '/images/menu/Sườn Cừu Nướng Lá Hương Thảo/pixabay_282865_07.jpg',
  '/images/menu/Sườn Cừu Nướng Lá Hương Thảo/pixabay_656410_05.jpg',
  '/images/menu/Tôm Càng Xanh Sốt Me/pixabay_4773380_05.jpg',
  '/images/menu/Tôm Càng Xanh Sốt Me/pixabay_6523368_02.jpg',
  '/images/menu/Tôm Hùm Nướng Bơ Tỏi/pixabay_3535048_04.jpg',
  '/images/menu/Tôm Hùm Nướng Bơ Tỏi/pixabay_74258_07.jpg',
  '/images/menu/Vịt Quay Bắc Kinh/pixabay_2629784_02.jpg',
  '/images/menu/Vịt Quay Bắc Kinh/pixabay_6826022_01.jpg',
  '/images/menu/Vịt Quay Bắc Kinh/pixabay_898500_04.jpg',
  '/images/menu/Đĩa Sashimi Cá Hồi Tươi/pixabay_1957234_02.jpg',
  '/images/menu/Đĩa Sashimi Cá Hồi Tươi/pixabay_471787_05.jpg',
  '/images/menu/Đĩa Sashimi Cá Hồi Tươi/pixabay_471795_06.jpg',
  '/images/menu/Đĩa Tráng Miệng Việt Cao Cấp/pixabay_5582984_01.jpg',
  '/images/menu/Đĩa Tráng Miệng Việt Cao Cấp/pixabay_5771746_04.jpg',
  '/images/menu/Đĩa Tráng Miệng Việt Cao Cấp/pixabay_6773324_07.jpg'
];

const MenuItemList = ({ menuItems, loading, onAddItem }) => {
  // State để lưu trữ lỗi hình ảnh
  const [imageErrors, setImageErrors] = useState({});
  const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150' width='150' height='150'%3e%3crect width='100%25' height='100%25' fill='%23e9ecef'/%3e%3ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' alignment-baseline='middle' font-family='sans-serif' fill='%236c757d'%3eLỗi ảnh%3c/text%3e%3c/svg%3e";

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * ALL_MENU_IMAGE_URLS.length);
    return `http://localhost:5000${encodeURI(ALL_MENU_IMAGE_URLS[randomIndex])}`;
  }

  // Generate placeholder image URL if no image is available
  const getImageUrl = (item) => {
    if (imageErrors[item._id]) {
      return getRandomImage();
    }
    
    if (item.imageUrls && item.imageUrls.length > 0) {
      const imageUrl = item.imageUrls[0];
      // Images are served from the backend, so prepend the backend URL
      if (imageUrl.startsWith('/')) {
        return `http://localhost:5000${encodeURI(imageUrl)}`;
      }
      return encodeURI(imageUrl);
    }
    
    return getRandomImage();
  };
  
  // Xử lý lỗi hình ảnh
  const handleImageError = (e, itemId) => {
    if (!imageErrors[itemId]) {
      setImageErrors(prev => ({
        ...prev,
        [itemId]: true
      }));
      e.target.src = getRandomImage();
    }
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
                      onError={(e) => handleImageError(e, item._id)}
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