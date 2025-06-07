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
              src={getImageUrl('/images/banner-image.jpg')}
              alt="Delicious Food" 
              className="img-fluid rounded-circle"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getImageUrl(null);
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
                      src={getImageUrl(item.imageUrls?.[0])}
                      alt={item.name}
                      style={{ height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getImageUrl(null);
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