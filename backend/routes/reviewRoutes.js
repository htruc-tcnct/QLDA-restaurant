const express = require('express');
const router = express.Router();
const {
  createReview,
  getMenuItemReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

// Routes for /api/reviews
router.route('/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router; 