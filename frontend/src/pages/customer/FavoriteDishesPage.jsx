import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Alert
} from 'react-bootstrap';
import { 
  FaHeart, 
  FaStar, 
  FaEye, 
  FaTrashAlt,
  FaRegSadTear
} from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/format';
import MenuItemDetailModal from '../../components/customer/MenuItemDetailModal';
import useAuthStore from '../../store/authStore';
import { Navigate } from 'react-router-dom';

const FavoriteDishesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get user info from auth store
  const { isAuthenticated } = useAuthStore();

  // Fetch favorites on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorite dishes');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (menuItemId) => {
    try {
      await api.delete(`/api/favorites/${menuItemId}`);
      setFavorites(favorites.filter(fav => fav.menuItem._id !== menuItemId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleToggleFavorite = async (menuItemId) => {
    handleRemoveFavorite(menuItemId);
    
    // Close modal if the removed item is currently selected
    if (selectedItem && selectedItem._id === menuItemId) {
      setShowDetailModal(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="favorite-dishes-page">
      <Container className="py-5">
        <div className="mb-4">
          <h1 className="mb-3 d-flex align-items-center">
            <FaHeart className="text-danger me-2" /> 
            My Favorite Dishes
          </h1>
          <p className="text-muted">
            Here are all the dishes you've marked as favorites. 
            You can easily access and order them from this page.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <Alert variant="info" className="text-center py-5">
            <FaRegSadTear size={40} className="mb-3" />
            <h4>No favorite dishes yet</h4>
            <p className="mb-4">
              You haven't added any dishes to your favorites.
              Browse our menu and add some dishes you love!
            </p>
            <Button 
              variant="primary" 
              href="/menu"
              size="lg"
            >
              Browse Menu
            </Button>
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {favorites.map(favorite => {
              const item = favorite.menuItem;
              return (
                <Col key={item._id}>
                  <Card className="h-100 shadow-sm hover-shadow">
                    {/* Card Image */}
                    <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                      <Card.Img 
                        variant="top" 
                        src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={item.name}
                        style={{ height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        }}
                      />
                      {/* Overlay Badges */}
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        {item.chefRecommended && (
                          <Badge 
                            bg="warning" 
                            text="dark"
                            className="me-1 d-flex align-items-center"
                            style={{ padding: '6px 8px' }}
                          >
                            <FaStar className="me-1" /> Chef's Choice
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Card.Title className="h5 mb-0">{item.name}</Card.Title>
                        <Badge bg="primary">{item.category}</Badge>
                      </div>
                      
                      <Card.Text className="text-muted" style={{ minHeight: '3rem' }}>
                        {item.description 
                          ? (item.description.length > 100 
                              ? `${item.description.substring(0, 100)}...` 
                              : item.description)
                          : 'No description available'}
                      </Card.Text>
                      
                      {/* Rating and Price */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <FaStar className="text-warning me-1" />
                          <span>
                            {item.averageRating > 0 
                              ? `${item.averageRating}/5 (${item.numReviews})` 
                              : 'No ratings'}
                          </span>
                        </div>
                        <h5 className="mb-0 text-primary">
                          {formatCurrency(item.price)}
                        </h5>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="d-flex justify-content-between">
                        <Button 
                          variant="outline-primary" 
                          className="w-75 me-2"
                          onClick={() => handleViewDetails(item)}
                        >
                          <FaEye className="me-1" /> View Details
                        </Button>
                        <Button 
                          variant="outline-danger"
                          className="px-3"
                          onClick={() => handleRemoveFavorite(item._id)}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
      
      {/* Menu Item Detail Modal */}
      <MenuItemDetailModal 
        show={showDetailModal}
        handleClose={() => setShowDetailModal(false)}
        menuItem={selectedItem}
        isFavorite={true} // All items here are favorites
        onToggleFavorite={handleToggleFavorite}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default FavoriteDishesPage; 