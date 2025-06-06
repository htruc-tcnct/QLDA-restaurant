const express = require('express');
const promotionController = require('../controllers/promotionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes cần xác thực và phân quyền
router.use(authController.protect);

// Validate và áp dụng mã khuyến mãi - tất cả người dùng đã đăng nhập
router.post('/validate', promotionController.validatePromotion);
router.post('/apply', promotionController.applyPromotion);

// Routes chỉ dành cho quản trị viên
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(promotionController.getAllPromotions)
  .post(promotionController.createPromotion);

router
  .route('/:id')
  .get(promotionController.getPromotion)
  .patch(promotionController.updatePromotion)
  .delete(promotionController.deletePromotion);

module.exports = router; 