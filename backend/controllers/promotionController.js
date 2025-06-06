const Promotion = require("../models/Promotion");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// @desc    Get all promotions (with filters)
// @route   GET /api/v1/promotions
// @access  Private (manager)
exports.getAllPromotions = catchAsync(async (req, res, next) => {
  console.log("Received query params:", req.query);

  const filter = {};

  // Filter by active status if specified
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  // Filter by promotion type if specified
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Current date to check active dates
  const now = new Date();

  // Filter for date status if specified
  if (req.query.dateStatus) {
    switch (req.query.dateStatus) {
      case "current":
        // Currently valid (within date range)
        filter.startDate = { $lte: now };
        filter.endDate = { $gte: now };
        break;
      case "upcoming":
        // Not started yet
        filter.startDate = { $gt: now };
        break;
      case "expired":
        // Already ended
        filter.endDate = { $lt: now };
        break;
    }
  }

  console.log("Final MongoDB filter:", filter);
  console.log("Current date for comparison:", now);

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
    status: "success",
    results: promotions.length,
    totalPages: Math.ceil(totalPromotions / limit),
    currentPage: page,
    totalPromotions,
    data: {
      promotions,
    },
  });
});

// @desc    Create a new promotion
// @route   POST /api/v1/promotions
// @access  Private (manager)
exports.createPromotion = catchAsync(async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    applicableFor,
  } = req.body;

  // Kiểm tra mã khuyến mãi đã tồn tại chưa
  const existingPromo = await Promotion.findOne({ code: code.toUpperCase() });
  if (existingPromo) {
    return next(new AppError("Mã khuyến mãi đã tồn tại", 400));
  }

  // Tạo mã khuyến mãi mới
  const promotion = await Promotion.create({
    code,
    description,
    discountType,
    discountValue,
    minOrderValue: minOrderValue || 0,
    maxDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    applicableFor: applicableFor || "all",
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: {
      promotion,
    },
  });
});

// @desc    Get a single promotion
// @route   GET /api/v1/promotions/:id
// @access  Private (manager)
exports.getPromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id);

  if (!promotion) {
    return next(new AppError("Không tìm thấy mã khuyến mãi với ID này", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      promotion,
    },
  });
});

// @desc    Update a promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private (manager)
exports.updatePromotion = catchAsync(async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    startDate,
    endDate,
    isActive,
    usageLimit,
    applicableFor,
  } = req.body;

  // Nếu thay đổi code, kiểm tra code mới đã tồn tại chưa
  if (code) {
    const existingPromo = await Promotion.findOne({
      code: code.toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (existingPromo) {
      return next(new AppError("Mã khuyến mãi đã tồn tại", 400));
    }
  }

  // Find and update promotion
  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      isActive,
      usageLimit,
      applicableFor,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!promotion) {
    return next(new AppError("Không tìm thấy mã khuyến mãi với ID này", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      promotion,
    },
  });
});

// @desc    Delete a promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private (manager)
exports.deletePromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);

  if (!promotion) {
    return next(new AppError("Không tìm thấy mã khuyến mãi với ID này", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc    Toggle promotion active status
// @route   PATCH /api/v1/promotions/:id/toggle-status
// @access  Private (manager)
exports.togglePromotionStatus = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id);

  if (!promotion) {
    return next(new AppError("Không tìm thấy khuyến mãi với ID này", 404));
  }

  promotion.isActive = !promotion.isActive;
  await promotion.save();

  res.status(200).json({
    status: "success",
    data: {
      promotion,
    },
  });
});

// @desc    Apply promotion code
// @route   POST /api/v1/promotions/apply-code
// @access  Private (authenticated user)
exports.applyPromoCode = catchAsync(async (req, res, next) => {
  const { code, orderTotal } = req.body;

  if (!code) {
    return next(new AppError("Vui lòng cung cấp mã khuyến mãi", 400));
  }

  if (!orderTotal || orderTotal <= 0) {
    return next(new AppError("Tổng giá trị đơn hàng không hợp lệ", 400));
  }

  // Find promotion by code (case insensitive)
  const promotion = await Promotion.findOne({ code: code.toUpperCase() });

  if (!promotion) {
    return next(new AppError("Mã khuyến mãi không tồn tại", 404));
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
    status: "success",
    data: {
      promotion: {
        _id: promotion._id,
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
      },
      discountAmount,
      originalTotal: orderTotal,
      newTotal,
    },
  });
});

// Kiểm tra mã khuyến mãi có hợp lệ không
exports.validatePromotion = catchAsync(async (req, res, next) => {
  const { code, orderTotal } = req.body;

  if (!code) {
    return next(new AppError("Vui lòng cung cấp mã khuyến mãi", 400));
  }

  const promotion = await Promotion.findOne({ code: code.toUpperCase() });

  if (!promotion) {
    return next(new AppError("Mã khuyến mãi không tồn tại", 404));
  }

  // Kiểm tra mã có hợp lệ không
  if (!promotion.isValid()) {
    return next(
      new AppError("Mã khuyến mãi đã hết hạn hoặc không còn hiệu lực", 400)
    );
  }

  // Kiểm tra giá trị đơn hàng tối thiểu
  if (orderTotal && orderTotal < promotion.minOrderValue) {
    return next(
      new AppError(
        `Đơn hàng cần tối thiểu ${promotion.minOrderValue.toLocaleString(
          "vi-VN"
        )}đ để áp dụng mã này`,
        400
      )
    );
  }

  // Tính toán giá trị giảm giá
  const discountAmount = promotion.calculateDiscount(orderTotal || 0);

  res.status(200).json({
    status: "success",
    data: {
      promotion,
      discountAmount,
      discountedTotal: orderTotal ? orderTotal - discountAmount : null,
    },
  });
});

// Áp dụng mã khuyến mãi (tăng số lần sử dụng)
exports.applyPromotion = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const promotion = await Promotion.findOne({ code: code.toUpperCase() });

  if (!promotion) {
    return next(new AppError("Mã khuyến mãi không tồn tại", 404));
  }

  // Tăng số lần sử dụng
  promotion.usageCount += 1;
  await promotion.save();

  res.status(200).json({
    status: "success",
    data: {
      promotion,
    },
  });
});
