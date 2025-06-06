const express = require("express");
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
  generateReceipt,
  applyPromotion,
  removePromotion,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Apply authentication to all routes
router.use(protect);

// Apply authorization to all routes
router.use(authorize("waiter", "staff", "manager", "chef"));

// Order routes
router
  .route("/")
  .get(getAllOrders)
  .post(authorize("waiter", "staff", "manager"), createOrder);

router.route("/:id").get(getOrder).delete(authorize("manager"), deleteOrder);

// Receipt route
router.route("/:id/receipt").get(generateReceipt);

// Table specific route
router.route("/table/:tableId/current").get(getCurrentTableOrder);

// Order items routes
router
  .route("/:id/add-item")
  .put(authorize("waiter", "staff", "manager"), addItemToOrder);

router
  .route("/:id/update-item/:orderItemId")
  .put(authorize("waiter", "staff", "manager"), updateOrderItem);

router
  .route("/:id/remove-item/:orderItemId")
  .delete(authorize("waiter", "staff", "manager"), removeOrderItem);

// Update item status route (accessible by chef)
router.route("/:id/update-item-status/:orderItemId").put(updateOrderItemStatus);

// Order status and payment routes
router.route("/:id/status").put(updateOrderStatus);

router
  .route("/:id/apply-discount")
  .put(authorize("staff", "staff", "manager"), applyDiscount);

// Promotion routes
router
  .route("/:id/apply-promotion")
  .put(authorize("staff", "manager", "customer"), applyPromotion);

router
  .route("/:id/remove-promotion")
  .delete(authorize("staff", "manager"), removePromotion);

router
  .route("/:id/checkout")
  .post(authorize("waiter", "staff", "manager"), checkoutOrder);

module.exports = router;
