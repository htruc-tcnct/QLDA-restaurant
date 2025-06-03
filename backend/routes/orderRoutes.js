const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getCurrentTableOrder,
  getOrder,
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
  updateOrderStatus,
  updateOrderItemStatus,
  applyDiscount,
  checkoutOrder,
  deleteOrder,
  generateReceipt
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Apply authorization to all routes
router.use(authorize('waiter', 'manager', 'chef'));

// Order routes
router
  .route('/')
  .get(getAllOrders)
  .post(authorize('waiter', 'manager'), createOrder);

router
  .route('/:id')
  .get(getOrder)
  .delete(authorize('manager'), deleteOrder);

// Receipt route
router
  .route('/:id/receipt')
  .get(generateReceipt);

// Table specific route
router
  .route('/table/:tableId/current')
  .get(getCurrentTableOrder);

// Order items routes
router
  .route('/:id/add-item')
  .put(authorize('waiter', 'manager'), addItemToOrder);

router
  .route('/:id/update-item/:orderItemId')
  .put(authorize('waiter', 'manager'), updateOrderItem);

router
  .route('/:id/remove-item/:orderItemId')
  .delete(authorize('waiter', 'manager'), removeOrderItem);

// Update item status route (accessible by chef)
router
  .route('/:id/update-item-status/:orderItemId')
  .put(updateOrderItemStatus);

// Order status and payment routes
router
  .route('/:id/status')
  .put(updateOrderStatus);

router
  .route('/:id/apply-discount')
  .put(authorize('waiter', 'manager'), applyDiscount);

router
  .route('/:id/checkout')
  .post(authorize('waiter', 'manager'), checkoutOrder);

module.exports = router; 