import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaStar, FaRegStar, FaPaperPlane } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';

const ReviewForm = ({ menuItemId, existingReview, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleMouseEnter = (value) => {
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      let response;
      
      if (existingReview) {
        // Update existing review
        response = await api.put(`/api/reviews/${existingReview._id}`, {
          rating,
          comment
        });
      } else {
        // Create new review
        response = await api.post(`/api/menu-items/${menuItemId}/reviews`, {
          rating,
          comment
        });
      }
      
      onReviewSubmitted(response.data);
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (position) => {
    const isActive = (hoveredRating || rating) >= position;
    const StarIcon = isActive ? FaStar : FaRegStar;
    
    return (
      <StarIcon
        key={position}
        className={`star ${isActive ? 'text-warning' : 'text-secondary'}`}
        style={{ cursor: 'pointer', fontSize: '1.5rem', marginRight: '0.5rem' }}
        onClick={() => handleRatingClick(position)}
        onMouseEnter={() => handleMouseEnter(position)}
        onMouseLeave={handleMouseLeave}
      />
    );
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </Card.Title>
        
        {error && (
          <Alert variant="danger" className="mt-2">
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Your Rating</Form.Label>
            <div className="d-flex align-items-center">
              {[1, 2, 3, 4, 5].map(position => renderStar(position))}
              <span className="ms-2 text-muted">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Your Review</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this item..."
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={onCancel}
              className="me-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
              className="d-flex align-items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane className="me-2" />
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

ReviewForm.propTypes = {
  menuItemId: PropTypes.string.isRequired,
  existingReview: PropTypes.object,
  onReviewSubmitted: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ReviewForm; 