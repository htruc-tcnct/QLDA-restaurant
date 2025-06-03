const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bàn phải có tên'],
      unique: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Sức chứa của bàn là bắt buộc'],
      min: [1, 'Sức chứa tối thiểu là 1 người']
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'unavailable', 'needs_cleaning'],
      default: 'available'
    },
    location: {
      type: String,
      trim: true
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table; 