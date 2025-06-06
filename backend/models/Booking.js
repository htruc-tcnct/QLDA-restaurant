const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'cancelled_by_customer', 'completed', 'no-show'],
      default: 'pending',
    },
    tableAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
    preOrderedItems: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        notes: String,
      },
    ],
    appliedPromotion: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion'
      },
      code: String,
      name: String,
      discountAmount: {
        type: Number,
        default: 0
      }
    },
    paymentInfo: {
      subtotal: {
        type: Number,
        default: 0
      },
      discountAmount: {
        type: Number,
        default: 0
      },
      totalAmount: {
        type: Number,
        default: 0
      },
      paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'ewallet'],
        default: 'cash'
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
      }
    }
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 