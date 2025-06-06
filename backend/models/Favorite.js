const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites
favoriteSchema.index({ user: 1, menuItem: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite; 