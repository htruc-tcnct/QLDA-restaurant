const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'MenuItem',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantServiceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews (one review per user per menu item)
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });

// Static method to calculate average rating for a menu item
reviewSchema.statics.calculateAverageRating = async function (menuItemId) {
  const stats = await this.aggregate([
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

  // Update menu item with calculated average rating and review count
  if (stats.length > 0) {
    await mongoose.model('MenuItem').findByIdAndUpdate(menuItemId, {
      averageRating: stats[0].avgRating.toFixed(1),
      numReviews: stats[0].numReviews,
    });
  } else {
    // If no reviews, reset to default values
    await mongoose.model('MenuItem').findByIdAndUpdate(menuItemId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.menuItem);
});

// Call calculateAverageRating before remove
reviewSchema.pre('remove', function () {
  this.constructor.calculateAverageRating(this.menuItem);
});

// Middleware to update ratings when review is updated or deleted
// Find before update/delete to get menuItemId
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

// After update/delete, calculate new ratings
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calculateAverageRating(this.r.menuItem);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 