import { useState, useEffect } from 'react';
import { 
  Modal, 
  Carousel, 
  Badge, 
  Row, 
  Col, 
  Button, 
  ListGroup, 
  Spinner,
  Tab,
  Tabs
} from 'react-bootstrap';
import { 
  FaStar, 
  FaRegStar,
  FaHeart, 
  FaRegHeart,
  FaTag, 
  FaUser, 
  FaCalendarAlt 
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import ReviewForm from './ReviewForm';
import useAuthStore from '../../store/authStore';

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

const MenuItemDetailModal = ({ 
  show, 
  handleClose, 
  menuItem, 
  isFavorite, 
  onToggleFavorite,
  isAuthenticated
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (show && menuItem) {
      fetchReviews();
      setActiveTab('details');
      setShowReviewForm(false);
    }
  }, [show, menuItem]);

  // Find if the current user has already reviewed this item
  useEffect(() => {
    if (isAuthenticated && user && reviews.length > 0) {
      const existingReview = reviews.find(review => 
        review.user._id === user._id
      );
      
      if (existingReview) {
        setUserReview(existingReview);
      } else {
        setUserReview(null);
      }
    } else {
      setUserReview(null);
    }
  }, [reviews, isAuthenticated, user]);

  const fetchReviews = async () => {
    if (!menuItem) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/menu-items/${menuItem._id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    // Update reviews list
    if (userReview) {
      // Update existing review in the list
      setReviews(reviews.map(review => 
        review._id === newReview._id ? newReview : review
      ));
    } else {
      // Add new review to the list
      setReviews([newReview, ...reviews]);
    }
    
    // Update user review state
    setUserReview(newReview);
    
    // Hide review form
    setShowReviewForm(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }
    
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      
      // Update reviews list
      setReviews(reviews.filter(review => review._id !== reviewId));
      
      // Reset user review state
      setUserReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getImageUrl = (url) => {
    if (url && url.startsWith('/')) {
      return `http://localhost:5000${encodeURI(url)}`;
    }
    if (url) {
      return encodeURI(url);
    }
    // Return a random image if no URL
    const randomIndex = Math.floor(Math.random() * ALL_MENU_IMAGE_URLS.length);
    return `http://localhost:5000${encodeURI(ALL_MENU_IMAGE_URLS[randomIndex])}`;
  };

  if (!menuItem) return null;

  // Helper function to render star ratings
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-warning' : 'text-secondary'}
        style={{ marginRight: '2px' }}
      />
    ));
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          {menuItem.name}
          {menuItem.chefRecommended && (
            <Badge 
              bg="warning" 
              text="dark" 
              className="ms-2 d-flex align-items-center"
            >
              <FaStar className="me-1" /> Chef's Choice
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="details" title="Details">
            <Row>
              <Col lg={6}>
                {menuItem.imageUrls && menuItem.imageUrls.length > 0 ? (
                  <Carousel className="mb-3">
                    {menuItem.imageUrls.map((url, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={getImageUrl(url)}
                          alt={`${menuItem.name} - Image ${index + 1}`}
                          style={{ height: '300px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageUrl(null);
                          }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center mb-3" style={{ height: '300px' }}>
                    <img
                      className="d-block w-100"
                      src={getImageUrl(null)}
                      alt={menuItem.name}
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                
                <div className="mb-3">
                  <h5>Description</h5>
                  <p>{menuItem.description || 'No description available'}</p>
                </div>
              </Col>
              
              <Col lg={6}>
                <div className="mb-4">
                  <h5>Item Details</h5>
                  <ListGroup variant="flush" className="border rounded">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Price</span>
                      <strong className="text-primary">{formatCurrency(menuItem.price)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Category</span>
                      <Badge bg="primary">{menuItem.category}</Badge>
                    </ListGroup.Item>
                    {menuItem.stockCount > 0 && (
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>In Stock</span>
                        <span>{menuItem.stockCount} items</span>
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Rating</span>
                      <div className="d-flex align-items-center">
                        {renderStars(menuItem.averageRating || 0)}
                        <strong className="ms-2">
                          {menuItem.averageRating > 0 ? menuItem.averageRating : '0'}/5
                        </strong>
                        <span className="text-muted ms-1">
                          ({menuItem.numReviews || 0})
                        </span>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </div>
                
                {menuItem.tags && menuItem.tags.length > 0 && (
                  <div className="mb-4">
                    <h5>Tags</h5>
                    <div>
                      {menuItem.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          bg="secondary" 
                          className="me-1 mb-1 p-2"
                        >
                          <FaTag className="me-1" /> {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Tab>
          
          <Tab eventKey="reviews" title={`Reviews (${menuItem.numReviews || 0})`}>
            <div className="reviews-container">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Customer Reviews</h5>
                
                {isAuthenticated && (
                  <Button 
                    variant={userReview ? "outline-primary" : "primary"} 
                    size="sm"
                    onClick={() => setShowReviewForm(true)}
                  >
                    {userReview ? "Edit Your Review" : "Write a Review"}
                  </Button>
                )}
              </div>
              
              {showReviewForm && (
                <ReviewForm 
                  menuItemId={menuItem._id}
                  existingReview={userReview}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
              
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-4 border rounded">
                  <p className="text-muted mb-0">No reviews yet. Be the first to review this item!</p>
                </div>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                            <FaUser />
                          </div>
                          <div>
                            <div><strong>{review.user.fullName || review.user.username}</strong></div>
                            <div className="text-muted small">
                              <FaCalendarAlt className="me-1" />
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          {renderStars(review.rating)}
                          <span className="ms-2">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="mb-1">{review.comment}</p>
                      
                      {/* Show edit/delete buttons for user's own review */}
                      {user && review.user._id === user._id && (
                        <div className="d-flex justify-content-end mt-2">
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => {
                              setShowReviewForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            {isAuthenticated && (
              <Button 
                variant={isFavorite ? "danger" : "outline-danger"}
                onClick={() => onToggleFavorite(menuItem._id)}
                className="me-2"
              >
                {isFavorite ? (
                  <><FaHeart className="me-1" /> Remove from Favorites</>
                ) : (
                  <><FaRegHeart className="me-1" /> Add to Favorites</>
                )}
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

MenuItemDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  menuItem: PropTypes.object,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};

export default MenuItemDetailModal; 