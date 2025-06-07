import { useState, useEffect } from 'react';
import { Modal, Carousel, Badge, Row, Col, Button, ListGroup, Spinner } from 'react-bootstrap';
import { FaStar, FaTimes, FaTag, FaUser, FaCalendarAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

const MenuItemDetailModal = ({ show, handleClose, menuItem }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && menuItem) {
      fetchReviews();
    }
  }, [show, menuItem]);

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
    >
      <Modal.Header closeButton>
        <Modal.Title>{menuItem.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            {menuItem.imageUrls && menuItem.imageUrls.length > 0 ? (
              <Carousel className="mb-3">
                {menuItem.imageUrls.map((url, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={url}
                      alt={`${menuItem.name} - Image ${index + 1}`}
                      style={{ height: '300px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                      }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center mb-3" style={{ height: '300px' }}>
                <p className="text-muted">No images available</p>
              </div>
            )}
            
            <div className="mb-3">
              <h5>Description</h5>
              <p>{menuItem.description || 'No description available'}</p>
            </div>
            
            <div className="mb-3">
              <h5>Item Details</h5>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Price</span>
                  <strong>{formatCurrency(menuItem.price)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Category</span>
                  <Badge bg="primary">{menuItem.category}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Status</span>
                  <Badge bg={menuItem.isAvailable ? 'success' : 'secondary'}>
                    {menuItem.isAvailable ? 'Available' : 'Hidden'}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Chef Recommended</span>
                  <Badge bg={menuItem.chefRecommended ? 'warning' : 'secondary'}>
                    {menuItem.chefRecommended ? 'Yes' : 'No'}
                  </Badge>
                </ListGroup.Item>
                {menuItem.stockCount > 0 && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span>In Stock</span>
                    <span>{menuItem.stockCount} items</span>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
            
            {menuItem.tags && menuItem.tags.length > 0 && (
              <div className="mb-3">
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
          
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Reviews & Ratings</h5>
              <div className="d-flex align-items-center">
                {renderStars(menuItem.averageRating || 0)}
                <strong className="ms-2">
                  {menuItem.averageRating > 0 ? menuItem.averageRating : '0'}/5
                </strong>
                <span className="text-muted ms-2">
                  ({menuItem.numReviews || 0} reviews)
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-3 border rounded">
                <p className="text-muted mb-0">No reviews yet</p>
              </div>
            ) : (
              <div className="review-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {reviews.map((review) => (
                  <div key={review._id} className="border-bottom mb-3 pb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <FaUser className="text-secondary me-2" />
                        <strong>{review.user.fullName || review.user.username}</strong>
                      </div>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <p className="mb-2">{review.comment}</p>
                    <div className="d-flex align-items-center text-muted small">
                      <FaCalendarAlt className="me-1" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

MenuItemDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  menuItem: PropTypes.object
};

export default MenuItemDetailModal; 