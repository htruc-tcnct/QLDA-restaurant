import { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Dropdown, 
  Spinner, 
  Image 
} from 'react-bootstrap';
import { 
  FaUtensils, 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaEyeSlash, 
  FaTrashAlt, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaSortAmountDown,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/format';
import MenuItemFormModal from '../../components/admin/MenuItemFormModal';
import MenuItemDetailModal from '../../components/admin/MenuItemDetailModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const MenuManagementPage = () => {
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    available: '',
    recommended: ''
  });
  const [sortOption, setSortOption] = useState('-createdAt');
  
  // State for modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Fetch menu items and categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch menu items when filters, sort or pagination changes
  useEffect(() => {
    fetchMenuItems();
  }, [filters, sortOption, currentPage, itemsPerPage]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/menu-items', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortOption,
          search: filters.search || undefined,
          category: filters.category || undefined,
          available: filters.available || undefined,
          recommended: filters.recommended || undefined
        }
      });
      
      setMenuItems(response.data.menuItems);
      setTotalItems(response.data.total);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/menu-items/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedMenuItem(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (menuItem) => {
    setModalMode('edit');
    setSelectedMenuItem(menuItem);
    setShowFormModal(true);
  };

  const handleOpenDetailModal = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowDetailModal(true);
  };

  const handleOpenDeleteConfirm = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setConfirmMessage(`Are you sure you want to delete "${menuItem.name}"? This action cannot be undone.`);
    setConfirmAction(() => () => handleDeleteMenuItem(menuItem._id));
    setShowConfirmModal(true);
  };

  const handleOpenToggleConfirm = (menuItem) => {
    const action = menuItem.isAvailable ? 'hide' : 'show';
    setSelectedMenuItem(menuItem);
    setConfirmMessage(`Are you sure you want to ${action} "${menuItem.name}" from the menu?`);
    setConfirmAction(() => () => handleToggleAvailability(menuItem._id));
    setShowConfirmModal(true);
  };

  // Menu item CRUD operations
  const handleItemSaved = (savedItem, isNew) => {
    if (isNew) {
      toast.success(`"${savedItem.name}" has been added to the menu`);
    } else {
      toast.success(`"${savedItem.name}" has been updated`);
      
      // Update item in the list
      setMenuItems(menuItems.map(item => 
        item._id === savedItem._id ? savedItem : item
      ));
    }
    
    // Refresh menu items
    fetchMenuItems();
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    try {
      await api.delete(`/api/menu-items/${menuItemId}`);
      
      toast.success('Menu item has been deleted');
      
      // Refresh menu items
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (menuItemId) => {
    try {
      const response = await api.patch(`/api/menu-items/${menuItemId}/toggle`);
      
      const message = response.data.isAvailable 
        ? 'Menu item is now visible to customers' 
        : 'Menu item is now hidden from customers';
      
      toast.success(message);
      
      // Update item in the list
      setMenuItems(menuItems.map(item => 
        item._id === menuItemId 
          ? { ...item, isAvailable: response.data.isAvailable } 
          : item
      ));
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      toast.error('Failed to update menu item');
    }
  };

  // Filter and sort handlers
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      available: '',
      recommended: ''
    });
    setSortOption('-createdAt');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    
    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </li>
    );
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }
    
    // Next button
    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </li>
    );
    
    return (
      <nav aria-label="Menu items pagination">
        <ul className="pagination justify-content-center mb-0">
          {pages}
        </ul>
      </nav>
    );
  };

  // Renders the status badge for menu items
  const renderStatusBadge = (menuItem) => {
    if (menuItem.isAvailable) {
      return (
        <Badge bg="success" className="d-flex align-items-center justify-content-center w-100">
          <FaCheck className="me-1" /> Available
        </Badge>
      );
    } else {
      return (
        <Badge bg="secondary" className="d-flex align-items-center justify-content-center w-100">
          <FaTimes className="me-1" /> Hidden
        </Badge>
      );
    }
  };

  // Renders star rating
  const renderStarRating = (rating) => {
    if (!rating || rating === 0) {
      return <span className="text-muted">No ratings</span>;
    }
    
    return (
      <div className="d-flex align-items-center">
        <FaStar className="text-warning me-1" />
        <span>{rating} ({menuItem.numReviews || 0})</span>
      </div>
    );
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0 d-flex align-items-center">
              <FaUtensils className="me-2 text-primary" /> 
              Menu Management
            </h2>
            <Button 
              variant="primary" 
              onClick={handleOpenAddModal}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" /> Add New Item
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Filters */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search menu items..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <Form.Select 
                value={filters.available}
                onChange={(e) => handleFilterChange('available', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="true">Available</option>
                <option value="false">Hidden</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Select 
                value={filters.recommended}
                onChange={(e) => handleFilterChange('recommended', e.target.value)}
              >
                <option value="">All Items</option>
                <option value="true">Chef Recommended</option>
                <option value="false">Not Recommended</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSortAmountDown />
                </InputGroup.Text>
                <Form.Select 
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="price">Price (Low-High)</option>
                  <option value="-price">Price (High-Low)</option>
                  <option value="-averageRating">Rating (High-Low)</option>
                </Form.Select>
              </InputGroup>
            </Col>
            
            <Col md={1}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Col>
          </Row>
          
          {/* Menu Items Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-5">
              <h4>No menu items found</h4>
              <p className="text-muted">
                {Object.values(filters).some(filter => filter) 
                  ? 'Try adjusting your filters or search terms' 
                  : 'Add your first menu item to get started'}
              </p>
              <Button 
                variant="primary" 
                onClick={handleOpenAddModal}
                className="mt-3"
              >
                <FaPlus className="me-2" /> Add New Item
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Recommended</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th style={{ width: '160px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(menuItem => (
                      <tr key={menuItem._id}>
                        <td>
                          <Image 
                            src={menuItem.imageUrls && menuItem.imageUrls.length > 0 
                              ? menuItem.imageUrls[0] 
                              : 'https://via.placeholder.com/80?text=No+Image'}
                            alt={menuItem.name}
                            width={60}
                            height={60}
                            className="img-thumbnail"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80?text=Error';
                            }}
                          />
                        </td>
                        <td>
                          <strong>{menuItem.name}</strong>
                          {menuItem.tags && menuItem.tags.length > 0 && (
                            <div className="mt-1">
                              {menuItem.tags.slice(0, 2).map(tag => (
                                <Badge 
                                  key={tag} 
                                  bg="secondary" 
                                  className="me-1"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {menuItem.tags.length > 2 && (
                                <Badge 
                                  bg="secondary" 
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  +{menuItem.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge bg="primary" pill>
                            {menuItem.category}
                          </Badge>
                        </td>
                        <td>
                          <strong>{formatCurrency(menuItem.price)}</strong>
                        </td>
                        <td>
                          {renderStatusBadge(menuItem)}
                        </td>
                        <td className="text-center">
                          {menuItem.chefRecommended ? (
                            <FaStar className="text-warning" size={18} />
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          {menuItem.stockCount > 0 ? menuItem.stockCount : '—'}
                        </td>
                        <td>
                          {menuItem.averageRating > 0 ? (
                            <div className="d-flex align-items-center">
                              <FaStar className="text-warning me-1" />
                              <span>{menuItem.averageRating} ({menuItem.numReviews})</span>
                            </div>
                          ) : (
                            <span className="text-muted">No ratings</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleOpenEditModal(menuItem)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="info" 
                              size="sm"
                              onClick={() => handleOpenDetailModal(menuItem)}
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              variant={menuItem.isAvailable ? "warning" : "success"} 
                              size="sm"
                              onClick={() => handleOpenToggleConfirm(menuItem)}
                              title={menuItem.isAvailable ? "Hide from menu" : "Show on menu"}
                            >
                              {menuItem.isAvailable ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleOpenDeleteConfirm(menuItem)}
                              title="Delete"
                            >
                              <FaTrashAlt />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <span className="text-muted">
                    Showing {menuItems.length} of {totalItems} items
                  </span>
                </div>
                {totalPages > 1 && renderPagination()}
                <div>
                  <Form.Select 
                    size="sm" 
                    style={{ width: '100px' }} 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </Form.Select>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Modals */}
      <MenuItemFormModal 
        show={showFormModal}
        handleClose={() => setShowFormModal(false)}
        mode={modalMode}
        menuItem={selectedMenuItem}
        categories={categories}
        onItemSaved={handleItemSaved}
      />
      
      <MenuItemDetailModal
        show={showDetailModal}
        handleClose={() => setShowDetailModal(false)}
        menuItem={selectedMenuItem}
      />
      
      <ConfirmModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        message={confirmMessage}
        onConfirm={confirmAction}
      />
    </Container>
  );
};

export default MenuManagementPage; 