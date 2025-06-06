const Favorite = require('../models/Favorite');
const MenuItem = require('../models/MenuItem');

// @desc    Get all user favorites
// @route   GET /api/favorites
// @access  Private
const getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('menuItem')
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Add a menu item to favorites
// @route   POST /api/favorites
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { menuItemId } = req.body;

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      menuItem: menuItemId,
    });

    if (existingFavorite) {
      res.status(400);
      throw new Error('Menu item already in favorites');
    }

    // Add to favorites
    const favorite = await Favorite.create({
      user: req.user._id,
      menuItem: menuItemId,
    });

    await favorite.populate('menuItem');

    res.status(201).json(favorite);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Remove a menu item from favorites
// @route   DELETE /api/favorites/:menuItemId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      menuItem: menuItemId,
    });

    if (!favorite) {
      res.status(404);
      throw new Error('Favorite not found');
    }

    await favorite.remove();

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Check if a menu item is in user's favorites
// @route   GET /api/favorites/:menuItemId
// @access  Private
const checkFavorite = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      menuItem: menuItemId,
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
}; 