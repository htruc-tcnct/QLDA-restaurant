import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  DropdownButton 
} from 'react-bootstrap';
import { 
  FaUtensils, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaHeart, 
  FaRegHeart, 
  FaStar, 
  FaEye 
} from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/format';
import MenuItemDetailModal from '../../components/customer/MenuItemDetailModal';
import useAuthStore from '../../store/authStore';

const CustomerMenuPage = () => {
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recommended');
  
  // State for favorites
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  
  // State for modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get user info from auth store
  const { user, isAuthenticated } = useAuthStore();

  // Fetch menu items, categories, and favorites on component mount
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoritesLoading(false);
    }
  }, [isAuthenticated]);

  // Apply filters when filter states change
  useEffect(() => {
    applyFilters();
  }, [menuItems, searchTerm, categoryFilter, sortOption]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      console.log('Fetching menu items from:', '/api/menu-items');
      const response = await api.get('/api/menu-items', {
        params: { available: true }
      });
      console.log('API Response:', response);
      setMenuItems(response.data.menuItems);
      setFilteredItems(response.data.menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      console.log('Error details:', error.response || error.message);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from:', '/api/menu-items/categories/list');
      const response = await api.get('/api/menu-items/categories/list');
      console.log('Categories response:', response);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.log('Error details:', error.response || error.message);
    }
  };

  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const response = await api.get('/api/favorites');
      setFavorites(response.data.map(fav => fav.menuItem._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...menuItems];

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'recommended':
        result.sort((a, b) => {
          if (a.chefRecommended === b.chefRecommended) {
            return b.averageRating - a.averageRating;
          }
          return a.chefRecommended ? -1 : 1;
        });
        break;
      default:
        break;
    }

    setFilteredItems(result);
  };

  const handleToggleFavorite = async (menuItemId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to save favorites');
      return;
    }

    try {
      if (favorites.includes(menuItemId)) {
        // Remove from favorites
        await api.delete(`/api/favorites/${menuItemId}`);
        setFavorites(favorites.filter(id => id !== menuItemId));
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        await api.post('/api/favorites', { menuItemId });
        setFavorites([...favorites, menuItemId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Generate banner content
  const renderBanner = () => (
    <div className="bg-dark text-white py-5 mb-4 rounded shadow-sm">
      <Container>
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="display-4 fw-bold">Our Delicious Menu</h1>
            <p className="lead">
              Explore our wide selection of authentic Vietnamese cuisine, 
              prepared with fresh ingredients and traditional recipes.
            </p>
          </Col>
          <Col md={4} className="text-end d-none d-md-block">
            <img 
              src="/images/banner-image.jpg" 
              alt="Delicious Food" 
              className="img-fluid rounded-circle"
              style={{ maxHeight: '200px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200?text=Restaurant+Image';
              }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );

  return (
    <div className="customer-menu-page">
      {/* Banner Section */}
      {renderBanner()}
      
      <Container>
        {/* Filters and Search */}
        <Row className="mb-4 g-3">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>
                <FaFilter />
              </InputGroup.Text>
              <Form.Select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>
                <FaSort />
              </InputGroup.Text>
              <Form.Select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recommended">Chef Recommended</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </Form.Select>
            </InputGroup>
          </Col>
          <Col md={2}>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setSortOption('recommended');
              }}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
        
        {/* Category Quick Select */}
        <div className="mb-4 d-flex flex-wrap gap-2 justify-content-center">
          <Button 
            variant={categoryFilter === '' ? 'primary' : 'outline-primary'}
            onClick={() => setCategoryFilter('')}
            className="rounded-pill px-3"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'primary' : 'outline-primary'}
              onClick={() => setCategoryFilter(category)}
              className="rounded-pill px-3"
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <h3>No menu items found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4 mb-5">
            {filteredItems.map(item => (
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
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag} 
                            bg="secondary" 
                            className="me-1 mb-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge bg="secondary">+{item.tags.length - 3}</Badge>
                        )}
                      </div>
                    )}
                    
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
                        onClick={() => handleToggleFavorite(item._id)}
                        disabled={favoritesLoading}
                      >
                        {favorites.includes(item._id) 
                          ? <FaHeart /> 
                          : <FaRegHeart />}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      
      {/* Menu Item Detail Modal */}
      <MenuItemDetailModal 
        show={showDetailModal}
        handleClose={() => setShowDetailModal(false)}
        menuItem={selectedItem}
        isFavorite={selectedItem ? favorites.includes(selectedItem._id) : false}
        onToggleFavorite={handleToggleFavorite}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default CustomerMenuPage; 