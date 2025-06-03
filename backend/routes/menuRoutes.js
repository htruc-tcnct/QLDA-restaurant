const express = require('express');
const router = express.Router();
const { 
  getMenuItems, 
  getMenuItem, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  toggleMenuItem,
  getCategoryList
} = require('../controllers/menuController');
const { 
  getMenuItemReviews, 
  createReview 
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('admin', 'manager', 'chef'), createMenuItem);

// Get categories - phải đặt trước route có tham số /:id
router.route('/categories/list')
  .get(getCategoryList);

router.route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('admin', 'manager', 'chef'), updateMenuItem)
  .delete(protect, authorize('admin', 'manager'), deleteMenuItem);

// Toggle availability route
router.route('/:id/toggle')
  .patch(protect, authorize('admin', 'manager', 'chef'), toggleMenuItem);

// Review routes
router.route('/:menuItemId/reviews')
  .get(getMenuItemReviews)
  .post(protect, createReview);

module.exports = router; 