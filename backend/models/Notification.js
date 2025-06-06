const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['new_order', 'order_status_change', 'booking_reminder', 'system', 'new_booking', 'order_update'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    relatedResource: {
      type: {
        type: String,
        enum: ['order', 'booking', 'system']
      },
      id: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    targetRoles: {
      type: [String],
      enum: ['admin', 'manager', 'chef', 'waiter', 'staff', 'customer'],
      default: []
    }
  },
  { timestamps: true }
);

// Create an index for more efficient lookups by recipient and isRead status
notificationSchema.index({ recipient: 1, isRead: 1 });
// Create an index for filtering by type
notificationSchema.index({ type: 1 });
// Create an index for filtering by targetRoles
notificationSchema.index({ targetRoles: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 