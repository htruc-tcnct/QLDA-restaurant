const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const promotionController = require('../controllers/promotionController');

const router = express.Router();

// Public route to apply promo code (for customers and waiters)
router.post('/apply-code', protect, promotionController.applyPromoCode);

// All other routes require manager access
router.use(protect, authorize('manager'));

// CRUD routes
router.route('/')
  .get(promotionController.getAllPromotions)
  .post(promotionController.createPromotion);

router.route('/:id')
  .get(promotionController.getPromotion)
  .put(promotionController.updatePromotion)
  .delete(promotionController.deletePromotion);

// Toggle promotion active status
router.patch('/:id/toggle-status', promotionController.togglePromotionStatus);

module.exports = router; 