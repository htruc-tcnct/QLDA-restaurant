const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');

// @desc    Create a review
// @route   POST /api/menu-items/:menuItemId/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { rating, comment } = req.body;

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    // Check if user already submitted a review for this menu item
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      menuItem: menuItemId,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Menu item already reviewed');
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      menuItem: menuItemId,
      rating: Number(rating),
      comment,
    });

    // Populate user data
    await review.populate('user', 'fullName username');

    res.status(201).json(review);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Get all reviews for a menu item
// @route   GET /api/menu-items/:menuItemId/reviews
// @access  Public
const getMenuItemReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    // Get reviews
    const reviews = await Review.find({ menuItem: menuItemId })
      .populate('user', 'fullName username')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (Customer - own review only, or Admin)
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check if user is authorized to update this review
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' && 
      req.user.role !== 'manager'
    ) {
      res.status(403);
      throw new Error('Not authorized to update this review');
    }

    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();

    // Populate user data
    await updatedReview.populate('user', 'fullName username');

    res.json(updatedReview);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Customer - own review only, or Admin)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check if user is authorized to delete this review
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' && 
      req.user.role !== 'manager'
    ) {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    // Store menuItemId before deleting
    const menuItemId = review.menuItem;

    // Delete review
    await review.remove();

    // Manually update menu item ratings (already handled by pre-remove middleware, but just to be sure)
    const stats = await Review.aggregate([
      {
        $match: { menuItem: menuItemId },
      },
      {
        $group: {
          _id: '$menuItem',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        averageRating: stats[0].avgRating.toFixed(1),
        numReviews: stats[0].numReviews,
      });
    } else {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        averageRating: 0,
        numReviews: 0,
      });
    }

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  createReview,
  getMenuItemReviews,
  updateReview,
  deleteReview,
}; 