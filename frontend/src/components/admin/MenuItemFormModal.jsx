import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup, Badge, Image } from 'react-bootstrap';
import { 
  FaUtensils, 
  FaMoneyBillWave, 
  FaTag, 
  FaImage, 
  FaPlus, 
  FaTimes,
  FaStar,
  FaSave,
  FaEdit,
  FaWarehouse
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MenuItemFormModal = ({ show, handleClose, mode, menuItem, categories, onItemSaved }) => {
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrls: [''],
    isAvailable: true,
    chefRecommended: false,
    tags: [],
    stockCount: 0
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  
  // When menu item data changes or modal opens, reset form
  useEffect(() => {
    if (show) {
      if (mode === 'edit' && menuItem) {
        // Edit mode - fill form with menu item data
        setFormData({
          name: menuItem.name || '',
          description: menuItem.description || '',
          price: menuItem.price || '',
          category: menuItem.category || '',
          imageUrls: menuItem.imageUrls && menuItem.imageUrls.length > 0 
            ? [...menuItem.imageUrls] 
            : [''],
          isAvailable: menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
          chefRecommended: menuItem.chefRecommended || false,
          tags: menuItem.tags || [],
          stockCount: menuItem.stockCount !== undefined ? menuItem.stockCount : 0
        });
        
        // Set preview images
        if (menuItem.imageUrls && menuItem.imageUrls.length > 0) {
          setPreviewImages(menuItem.imageUrls);
        } else {
          setPreviewImages([]);
        }
      } else {
        // Add mode - reset form
        setFormData(initialFormState);
        setPreviewImages([]);
      }
      // Clear errors and tag input
      setValidationErrors({});
      setTagInput('');
    }
  }, [show, mode, menuItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({
      ...formData,
      [name]: numericValue
    });
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    
    setFormData({
      ...formData,
      imageUrls: newImageUrls
    });
    
    // Clear validation error
    if (validationErrors.imageUrls) {
      setValidationErrors({
        ...validationErrors,
        imageUrls: ''
      });
    }
    
    // Update preview for this index
    const newPreviews = [...previewImages];
    newPreviews[index] = value;
    setPreviewImages(newPreviews);
  };

  const addImageUrlField = () => {
    if (formData.imageUrls.length < 5) {
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, '']
      });
      
      setPreviewImages([...previewImages, '']);
    } else {
      toast.warning('Maximum 5 images allowed');
    }
  };

  const removeImageUrlField = (index) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      const newPreviews = previewImages.filter((_, i) => i !== index);
      
      setFormData({
        ...formData,
        imageUrls: newImageUrls
      });
      
      setPreviewImages(newPreviews);
    } else {
      // If it's the last one, just clear it
      setFormData({
        ...formData,
        imageUrls: ['']
      });
      
      setPreviewImages(['']);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      // Check if tag already exists
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Validate price
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    // Validate category
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    // Validate stock count
    if (formData.stockCount && (isNaN(formData.stockCount) || Number(formData.stockCount) < 0)) {
      errors.stockCount = 'Stock count must be a non-negative number';
    }
    
    // Validate image URLs
    if (formData.imageUrls.some(url => url.trim() && !isValidUrl(url))) {
      errors.imageUrls = 'Please enter valid image URLs';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      // Basic URL validation - accept local paths as well
      return url.startsWith('http') || url.startsWith('/') || url.startsWith('./');
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty image URLs
      const filteredImageUrls = formData.imageUrls.filter(url => url.trim());
      
      // Prepare data for API
      const menuItemData = {
        ...formData,
        price: Number(formData.price),
        stockCount: Number(formData.stockCount),
        imageUrls: filteredImageUrls
      };
      
      let response;
      
      if (mode === 'add') {
        // Create new menu item
        response = await api.post('/api/menu-items', menuItemData);
        onItemSaved(response.data, true);
      } else {
        // Update existing menu item
        response = await api.put(`/api/menu-items/${menuItem._id}`, menuItemData);
        onItemSaved(response.data, false);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving menu item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save menu item';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (mode === 'edit' && menuItem) {
      setFormData({
        name: menuItem.name || '',
        description: menuItem.description || '',
        price: menuItem.price || '',
        category: menuItem.category || '',
        imageUrls: menuItem.imageUrls && menuItem.imageUrls.length > 0 
          ? [...menuItem.imageUrls] 
          : [''],
        isAvailable: menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
        chefRecommended: menuItem.chefRecommended || false,
        tags: menuItem.tags || [],
        stockCount: menuItem.stockCount !== undefined ? menuItem.stockCount : 0
      });
      
      // Reset previews
      if (menuItem.imageUrls && menuItem.imageUrls.length > 0) {
        setPreviewImages(menuItem.imageUrls);
      } else {
        setPreviewImages([]);
      }
    } else {
      setFormData(initialFormState);
      setPreviewImages([]);
    }
    setValidationErrors({});
    setTagInput('');
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          {mode === 'add' ? (
            <>
              <FaUtensils className="me-2 text-primary" />
              Add New Menu Item
            </>
          ) : (
            <>
              <FaEdit className="me-2 text-primary" />
              Edit Menu Item
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="mb-3">
            <Col md={6}>
              {/* Name */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUtensils className="me-2" />
                  Item Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.name}
                  placeholder="Enter item name"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.name}
                </Form.Control.Feedback>
              </Form.Group>
              
              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaTag className="me-2" />
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description"
                />
              </Form.Group>
              
              {/* Category & Price */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaTag className="me-2" />
                      Category
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.category}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="other">Other</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.category}
                    </Form.Control.Feedback>
                    {formData.category === 'other' && (
                      <Form.Control
                        className="mt-2"
                        type="text"
                        name="newCategory"
                        placeholder="Enter new category"
                        onChange={(e) => setFormData({
                          ...formData,
                          category: e.target.value
                        })}
                      />
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaMoneyBillWave className="me-2" />
                      Price (VND)
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberInput}
                        isInvalid={!!validationErrors.price}
                        placeholder="Enter price"
                      />
                      <InputGroup.Text>VND</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.price}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Stock Count */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaWarehouse className="me-2" />
                  Stock Count (optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  name="stockCount"
                  value={formData.stockCount}
                  onChange={handleNumberInput}
                  isInvalid={!!validationErrors.stockCount}
                  placeholder="Enter stock count (if applicable)"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.stockCount}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Leave at 0 if no stock tracking is needed
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              {/* Image URLs */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaImage className="me-2" />
                  Images (max 5)
                </Form.Label>
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="mb-2">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder="Enter image URL"
                        isInvalid={!!validationErrors.imageUrls}
                      />
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeImageUrlField(index)}
                      >
                        <FaTimes />
                      </Button>
                    </InputGroup>
                    {url && (
                      <div className="mt-1 mb-2">
                        <Image 
                          src={url} 
                          alt="Preview" 
                          thumbnail 
                          style={{ height: '80px', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {formData.imageUrls.length < 5 && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={addImageUrlField}
                    className="mt-1"
                  >
                    <FaPlus className="me-1" /> Add Image URL
                  </Button>
                )}
                <Form.Control.Feedback type="invalid" style={{ display: validationErrors.imageUrls ? 'block' : 'none' }}>
                  {validationErrors.imageUrls}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Enter URLs for images in public/images/menu/ folder
                </Form.Text>
              </Form.Group>
              
              {/* Tags */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaTag className="me-2" />
                  Tags
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag and press Add"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleAddTag}
                  >
                    <FaPlus />
                  </Button>
                </InputGroup>
                <div className="mt-2">
                  {formData.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      bg="secondary" 
                      className="me-1 mb-1 p-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} <FaTimes />
                    </Badge>
                  ))}
                </div>
              </Form.Group>
              
              {/* Status Toggles */}
              <div className="border rounded p-3 mt-3">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is-available-switch"
                    label="Item is available"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Toggle to show/hide this item from the menu
                  </Form.Text>
                </Form.Group>
                
                <Form.Group>
                  <Form.Check
                    type="switch"
                    id="chef-recommended-switch"
                    label="Chef recommended"
                    name="chefRecommended"
                    checked={formData.chefRecommended}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Mark this item as chef's special recommendation
                  </Form.Text>
                </Form.Group>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={handleReset}>
            Reset
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
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {mode === 'add' ? 'Create Item' : 'Update Item'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

MenuItemFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']).isRequired,
  menuItem: PropTypes.object,
  categories: PropTypes.array.isRequired,
  onItemSaved: PropTypes.func.isRequired
};

export default MenuItemFormModal; 