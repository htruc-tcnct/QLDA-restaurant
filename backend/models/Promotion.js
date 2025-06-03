const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên khuyến mãi là bắt buộc'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'],
      required: [true, 'Loại khuyến mãi là bắt buộc']
    },
    value: {
      type: Number,
      required: [true, 'Giá trị khuyến mãi là bắt buộc'],
      min: [0, 'Giá trị khuyến mãi phải lớn hơn hoặc bằng 0']
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Allow multiple null values (for promotions without codes)
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc']
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
      validate: {
        validator: function(value) {
          return value >= this.startDate;
        },
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      }
    },
    minSpend: {
      type: Number,
      default: 0,
      min: [0, 'Số tiền tối thiểu phải lớn hơn hoặc bằng 0']
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, 'Số tiền giảm tối đa phải lớn hơn hoặc bằng 0']
    },
    usageLimit: {
      type: Number,
      min: [0, 'Giới hạn sử dụng phải lớn hơn hoặc bằng 0']
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Số lần sử dụng phải lớn hơn hoặc bằng 0']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure code is uppercase for consistency
promotionSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Method to check if promotion is valid for a given order amount
promotionSchema.methods.isValidForAmount = function(amount) {
  const now = new Date();
  
  // Check if promotion is active
  if (!this.isActive) {
    return { valid: false, message: 'Khuyến mãi không còn hiệu lực' };
  }
  
  // Check if promotion is within date range
  if (now < this.startDate || now > this.endDate) {
    return { valid: false, message: 'Khuyến mãi không trong thời hạn hiệu lực' };
  }
  
  // Check if usage limit is reached
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Khuyến mãi đã hết lượt sử dụng' };
  }
  
  // Check minimum spend
  if (amount < this.minSpend) {
    return { 
      valid: false, 
      message: `Đơn hàng cần tối thiểu ${this.minSpend.toLocaleString('vi-VN')}₫ để áp dụng khuyến mãi này` 
    };
  }
  
  return { valid: true };
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function(amount) {
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = amount * (this.value / 100);
      // Apply max discount cap if specified
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
      break;
    case 'fixed_amount':
      discount = Math.min(this.value, amount); // Don't discount more than the order amount
      break;
    case 'free_shipping':
      // Typically this would apply a shipping fee, but depends on implementation
      discount = this.value;
      break;
    case 'buy_x_get_y':
      // Complex logic would go here, simplified for now
      discount = 0;
      break;
    default:
      discount = 0;
  }
  
  return discount;
};

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion; 