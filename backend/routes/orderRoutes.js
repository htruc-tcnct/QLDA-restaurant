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
router.use(authorize('staff', 'waiter', 'admin', 'manager'));

// Order routes
router
  .route('/')
  .get(getAllOrders)
  .post(createOrder);

router
  .route('/:id')
  .get(getOrder)
  .delete(authorize('admin', 'manager'), deleteOrder);

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
  .put(addItemToOrder);

router
  .route('/:id/update-item/:orderItemId')
  .put(updateOrderItem);

router
  .route('/:id/remove-item/:orderItemId')
  .delete(removeOrderItem);

// Update item status route (now accessible by staff, admin via general auth)
router
  .route('/:id/update-item-status/:orderItemId')
  .put(updateOrderItemStatus);

// Order status and payment routes
router
  .route('/:id/status')
  .put(updateOrderStatus);

router
  .route('/:id/apply-discount')
  .put(applyDiscount);

router
  .route('/:id/checkout')
  .post(checkoutOrder);

module.exports = router; 