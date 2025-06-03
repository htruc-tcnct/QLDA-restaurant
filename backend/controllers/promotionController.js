const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all promotions (with filters)
// @route   GET /api/v1/promotions
// @access  Private (manager)
exports.getAllPromotions = catchAsync(async (req, res, next) => {
  const filter = {};
  
  // Filter by active status if specified
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  
  // Filter by promotion type if specified
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  // Current date to check active dates
  const now = new Date();
  
  // Filter for active dates if specified
  if (req.query.active === 'true') {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  } else if (req.query.active === 'false') {
    filter.$or = [
      { startDate: { $gt: now } },
      { endDate: { $lt: now } }
    ];
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Execute query with pagination
  const promotions = await Promotion.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const totalPromotions = await Promotion.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: promotions.length,
    totalPages: Math.ceil(totalPromotions / limit),
    currentPage: page,
    totalPromotions,
    data: {
      promotions
    }
  });
});

// @desc    Create a new promotion
// @route   POST /api/v1/promotions
// @access  Private (manager)
exports.createPromotion = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    type,
    value,
    code,
    startDate,
    endDate,
    minSpend,
    maxDiscountAmount,
    usageLimit,
    isActive
  } = req.body;
  
  // Check if code already exists (if provided)
  if (code) {
    const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (existingPromotion) {
      return next(new AppError('Mã khuyến mãi đã tồn tại', 400));
    }
  }
  
  // Create promotion
  const promotion = await Promotion.create({
    name,
    description,
    type,
    value,
    code,
    startDate,
    endDate,
    minSpend,
    maxDiscountAmount,
    usageLimit,
    isActive
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      promotion
    }
  });
});

// @desc    Get a single promotion
// @route   GET /api/v1/promotions/:id
// @access  Private (manager)
exports.getPromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id);
  
  if (!promotion) {
    return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      promotion
    }
  });
});

// @desc    Update a promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private (manager)
exports.updatePromotion = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    type,
    value,
    code,
    startDate,
    endDate,
    minSpend,
    maxDiscountAmount,
    usageLimit,
    isActive
  } = req.body;
  
  // Check if code already exists (if provided) and it's not the same promotion
  if (code) {
    const existingPromotion = await Promotion.findOne({
      code: code.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    
    if (existingPromotion) {
      return next(new AppError('Mã khuyến mãi đã tồn tại', 400));
    }
  }
  
  // Find and update promotion
  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      type,
      value,
      code,
      startDate,
      endDate,
      minSpend,
      maxDiscountAmount,
      usageLimit,
      isActive
    },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!promotion) {
    return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      promotion
    }
  });
});

// @desc    Delete a promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private (manager)
exports.deletePromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);
  
  if (!promotion) {
    return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Toggle promotion active status
// @route   PATCH /api/v1/promotions/:id/toggle-status
// @access  Private (manager)
exports.togglePromotionStatus = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id);
  
  if (!promotion) {
    return next(new AppError('Không tìm thấy khuyến mãi với ID này', 404));
  }
  
  promotion.isActive = !promotion.isActive;
  await promotion.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      promotion
    }
  });
});

// @desc    Apply promotion code
// @route   POST /api/v1/promotions/apply-code
// @access  Private (authenticated user)
exports.applyPromoCode = catchAsync(async (req, res, next) => {
  const { code, orderTotal } = req.body;
  
  if (!code) {
    return next(new AppError('Vui lòng cung cấp mã khuyến mãi', 400));
  }
  
  if (!orderTotal || orderTotal <= 0) {
    return next(new AppError('Tổng giá trị đơn hàng không hợp lệ', 400));
  }
  
  // Find promotion by code (case insensitive)
  const promotion = await Promotion.findOne({ code: code.toUpperCase() });
  
  if (!promotion) {
    return next(new AppError('Mã khuyến mãi không tồn tại', 404));
  }
  
  // Validate promotion for the order amount
  const validationResult = promotion.isValidForAmount(orderTotal);
  
  if (!validationResult.valid) {
    return next(new AppError(validationResult.message, 400));
  }
  
  // Calculate discount amount
  const discountAmount = promotion.calculateDiscount(orderTotal);
  
  // Calculate new total
  const newTotal = Math.max(0, orderTotal - discountAmount);
  
  res.status(200).json({
    status: 'success',
    data: {
      promotion: {
        _id: promotion._id,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value
      },
      discountAmount,
      originalTotal: orderTotal,
      newTotal
    }
  });
}); 