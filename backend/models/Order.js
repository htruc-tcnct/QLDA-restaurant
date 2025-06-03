const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Món ăn là bắt buộc']
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng tối thiểu là 1']
    },
    priceAtOrder: {
      type: Number,
      required: [true, 'Giá tại thời điểm đặt là bắt buộc']
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'served', 'cancelled_item'],
      default: 'pending'
    }
  },
  {
    _id: true,
    timestamps: false
  }
);

const splitBillItemSchema = new mongoose.Schema(
  {
    items: [
      {
        orderItem: {
          type: mongoose.Schema.Types.ObjectId
        },
        quantity: {
          type: Number,
          min: 1
        }
      }
    ],
    subTotal: Number,
    taxAmount: Number,
    discountAmount: Number,
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  {
    _id: true,
    timestamps: true
  }
);

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Nhân viên phục vụ là bắt buộc']
    },
    items: [orderItemSchema],
    subTotal: {
      type: Number,
      required: [true, 'Tổng tiền trước thuế là bắt buộc']
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    discountPercentage: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Tổng tiền cuối cùng là bắt buộc']
    },
    orderStatus: {
      type: String,
      enum: [
        'pending_confirmation',
        'confirmed_by_customer',
        'partially_served',
        'fully_served',
        'payment_pending',
        'paid',
        'cancelled_order'
      ],
      default: 'pending_confirmation'
    },
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery'],
      default: 'dine-in'
    },
    paymentMethod: {
      type: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    orderNotes: {
      type: String,
      trim: true
    },
    splitBillInfo: [splitBillItemSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to validate and calculate totals
orderSchema.pre('save', function(next) {
  try {
    // Validate order type and table
    if (this.orderType === 'dine-in' && !this.table) {
      throw new Error('Đơn hàng tại bàn phải có bàn');
    }

    // Calculate subTotal if items exist
    if (this.items && this.items.length > 0) {
      this.subTotal = this.items.reduce(
        (total, item) => total + item.priceAtOrder * item.quantity,
        0
      );
    }

    // Apply discount
    if (this.discountPercentage > 0) {
      this.discountAmount = this.subTotal * (this.discountPercentage / 100);
    }

    // Calculate tax amount
    if (this.taxRate > 0) {
      this.taxAmount = (this.subTotal - this.discountAmount) * this.taxRate;
    }

    // Calculate total amount
    this.totalAmount = this.subTotal - this.discountAmount + this.taxAmount;

    next();
  } catch (error) {
    next(error);
  }
});

// Create virtual to get total number of items
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to add item to order
orderSchema.methods.addItem = async function(itemData) {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    item => item.menuItem.toString() === itemData.menuItem.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += itemData.quantity;
    this.items[existingItemIndex].notes = itemData.notes || this.items[existingItemIndex].notes;
  } else {
    // Add new item
    this.items.push(itemData);
  }

  return this.save();
};

// Method to update order status and related items status
orderSchema.methods.updateStatus = async function(newStatus, itemsStatus) {
  this.orderStatus = newStatus;

  // If itemsStatus is provided, update status for those items
  if (itemsStatus && itemsStatus.length > 0) {
    itemsStatus.forEach(update => {
      const itemIndex = this.items.findIndex(
        item => item._id.toString() === update.itemId.toString()
      );
      if (itemIndex > -1) {
        this.items[itemIndex].status = update.status;
      }
    });
  }

  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 