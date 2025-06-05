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
      enum: ['new_order', 'order_status_change', 'booking_reminder', 'system', 'new_booking'],
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
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 