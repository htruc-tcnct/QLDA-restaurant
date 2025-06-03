const express = require('express');
const router = express.Router();
const {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Get all favorites and add new favorite
router.route('/')
  .get(getUserFavorites)
  .post(addToFavorites);

// Check if item is favorite and remove from favorites
router.route('/:menuItemId')
  .get(checkFavorite)
  .delete(removeFromFavorites);

module.exports = router; 