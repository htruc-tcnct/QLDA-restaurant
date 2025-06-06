const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Promotion = require('../models/Promotion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private (staff, manager)
exports.createOrder = catchAsync(async (req, res, next) => {
  const { tableId, items, orderType, orderNotes } = req.body;

  // Validate basic input
  if (!items || !items.length) {
    return next(new AppError('Đơn hàng phải có ít nhất một món', 400));
  }

  if (orderType === 'dine-in' && !tableId) {
    return next(new AppError('Đơn hàng tại bàn phải có bàn', 400));
  }

  // Check table availability if it's a dine-in order
  if (tableId) {
    const table = await Table.findById(tableId);

    if (!table) {
      return next(new AppError('Không tìm thấy bàn với ID này', 404));
    }

    if (table.status !== 'available' && table.status !== 'reserved') {
      return next(new AppError('Bàn không khả dụng', 400));
    }
  }

  // Get current prices for all menu items
  const menuItemIds = items.map(item => item.menuItem);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  if (menuItems.length !== menuItemIds.length) {
    return next(new AppError('Một số món ăn không tồn tại', 400));
  }

  // Create order items with current prices
  const orderItems = items.map(item => {
    const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItem.toString());

    if (!menuItem) {
      throw new AppError(`Không tìm thấy món ăn với ID: ${item.menuItem}`, 400);
    }

    return {
      menuItem: item.menuItem,
      quantity: item.quantity,
      priceAtOrder: menuItem.price,
      notes: item.notes || '',
      status: 'pending'
    };
  });

  // Calculate initial totals
  const subTotal = orderItems.reduce(
    (total, item) => total + (item.priceAtOrder * item.quantity),
    0
  );

  // Default tax rate (can be configured as needed)
  const taxRate = 0.1; // 10% tax
  const taxAmount = subTotal * taxRate;
  const totalAmount = subTotal + taxAmount;

  // Create the order
  const order = await Order.create({
    table: tableId || null,
    waiter: req.user._id, // The logged-in user (waiter/manager)
    items: orderItems,
    subTotal,
    taxRate,
    taxAmount,
    totalAmount,
    orderType: orderType || 'dine-in',
    orderNotes: orderNotes || '',
    orderStatus: 'pending_confirmation'
  });

  // Update table status if it's a dine-in order
  if (tableId) {
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      currentOrderId: order._id
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private (waiter, manager)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  // Build filter object
  const filter = {};

  // Filter by order status
  if (req.query.orderStatus) {
    filter.orderStatus = req.query.orderStatus;
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  // Filter by table
  if (req.query.tableId) {
    filter.table = req.query.tableId;
  }

  // Filter by waiter
  if (req.query.waiterId) {
    filter.waiter = req.query.waiterId;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Execute query with pagination
  // const orders = await Order.find({});
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate([
      { path: 'table', select: 'name location' },
      { path: 'waiter', select: 'fullName' },
      { path: 'customer', select: 'fullName email' },
      { path: 'items.menuItem', select: 'name category price' }
    ]);

  // Get total count
  const totalOrders = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
    totalOrders,
    data: {
      orders
    }
  });
});

// @desc    Get current order for a table
// @route   GET /api/v1/orders/table/:tableId/current
// @access  Private (waiter, manager)
exports.getCurrentTableOrder = catchAsync(async (req, res, next) => {
  const { tableId } = req.params;

  // Find table first
  const table = await Table.findById(tableId);

  if (!table) {
    return next(new AppError('Không tìm thấy bàn với ID này', 404));
  }

  if (!table.currentOrderId) {
    return next(new AppError('Bàn này không có đơn hàng đang hoạt động', 404));
  }

  // Get the current order
  const order = await Order.findById(table.currentOrderId)
    .populate([
      { path: 'table', select: 'name location' },
      { path: 'waiter', select: 'fullName' },
      { path: 'customer', select: 'fullName email' },
      { path: 'items.menuItem', select: 'name category price imageUrls' }
    ]);

  if (!order) {
    // Handle inconsistency - table references a non-existent order
    table.currentOrderId = null;
    await table.save();
    return next(new AppError('Không tìm thấy đơn hàng của bàn này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private (waiter, manager)
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate([
      { path: 'table', select: 'name location' },
      { path: 'waiter', select: 'fullName' },
      { path: 'customer', select: 'fullName email' },
      { path: 'items.menuItem', select: 'name category price imageUrls' }
    ]);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Add item to order
// @route   PUT /api/v1/orders/:id/add-item
// @access  Private (waiter, manager)
exports.addItemToOrder = catchAsync(async (req, res, next) => {
  const { menuItemId, quantity, notes, status } = req.body;

  if (!menuItemId || !quantity) {
    return next(new AppError('Vui lòng cung cấp ID món ăn và số lượng', 400));
  }

  // Find order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order status allows adding items
  const allowedStatuses = ['pending_confirmation', 'confirmed_by_customer', 'partially_served'];
  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(new AppError('Không thể thêm món vào đơn hàng này do đã qua bước xử lý', 400));
  }

  // Get menu item with current price
  const menuItem = await MenuItem.findById(menuItemId);

  if (!menuItem) {
    return next(new AppError('Không tìm thấy món ăn với ID này', 404));
  }

  // Check if item already exists in order
  const existingItemIndex = order.items.findIndex(
    item => item.menuItem.toString() === menuItemId
  );

  if (existingItemIndex > -1) {
    // Update existing item
    order.items[existingItemIndex].quantity += quantity;
    if (notes) {
      order.items[existingItemIndex].notes = notes;
    }
  } else {
    // Add new item
    order.items.push({
      menuItem: menuItemId,
      quantity,
      priceAtOrder: menuItem.price,
      notes: notes || '',
      status: status || 'pending' // Use provided status or default to 'pending'
    });
  }

  // Save the updated order
  await order.save();

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price imageUrls' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Update item in order
// @route   PUT /api/v1/orders/:id/update-item/:orderItemId
// @access  Private (waiter, manager)
exports.updateOrderItem = catchAsync(async (req, res, next) => {
  const { quantity, notes } = req.body;
  const { id, orderItemId } = req.params;

  // Find order
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order status allows updating items
  const allowedStatuses = ['pending_confirmation', 'confirmed_by_customer', 'partially_served', 'fully_served', 'payment_pending'];
  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(new AppError('Không thể cập nhật món do đơn hàng đã qua bước xử lý', 400));
  }

  // Find item in order
  const itemIndex = order.items.findIndex(
    item => item._id.toString() === orderItemId
  );

  if (itemIndex === -1) {
    return next(new AppError('Không tìm thấy món ăn trong đơn hàng', 404));
  }

  // Update item
  if (quantity && quantity > 0) {
    order.items[itemIndex].quantity = quantity;
  }

  if (notes !== undefined) {
    order.items[itemIndex].notes = notes;
  }

  // Save the updated order
  await order.save();

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price imageUrls' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Remove item from order
// @route   DELETE /api/v1/orders/:id/remove-item/:orderItemId
// @access  Private (waiter, manager)
exports.removeOrderItem = catchAsync(async (req, res, next) => {
  const { id, orderItemId } = req.params;

  // Find order
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order status allows removing items
  const allowedStatuses = ['pending_confirmation', 'confirmed_by_customer', 'partially_served'];
  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(new AppError('Không thể xóa món do đơn hàng đã qua bước xử lý', 400));
  }

  // Find item index
  const itemIndex = order.items.findIndex(
    item => item._id.toString() === orderItemId
  );

  if (itemIndex === -1) {
    return next(new AppError('Không tìm thấy món ăn trong đơn hàng', 404));
  }

  // Remove item
  order.items.splice(itemIndex, 1);

  // If no items left, return error
  if (order.items.length === 0) {
    return next(new AppError('Đơn hàng phải có ít nhất một món', 400));
  }

  // Save the updated order
  await order.save();

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price imageUrls' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (waiter, manager)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, itemsStatus } = req.body;

  if (!status) {
    return next(new AppError('Vui lòng cung cấp trạng thái mới', 400));
  }

  // Find order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Validate status transition
  const validTransitions = {
    'pending_confirmation': ['confirmed_by_customer', 'partially_served', 'fully_served', 'cancelled_order'],
    'confirmed_by_customer': ['partially_served', 'fully_served', 'cancelled_order'],
    'partially_served': ['fully_served', 'payment_pending', 'cancelled_order'],
    'fully_served': ['partially_served', 'payment_pending', 'cancelled_order'],
    'payment_pending': ['paid', 'cancelled_order'],
    'paid': [],  // Terminal state, no further transitions
    'cancelled_order': [] // Terminal state
  };

  if (!validTransitions[order.orderStatus].includes(status)) {
    return next(new AppError(`Không thể chuyển từ trạng thái ${order.orderStatus} sang ${status}`, 400));
  }

  // Update order status
  order.orderStatus = status;

  // Update items status if provided
  if (itemsStatus && Array.isArray(itemsStatus)) {
    itemsStatus.forEach(update => {
      const itemIndex = order.items.findIndex(
        item => item._id.toString() === update.itemId
      );

      if (itemIndex > -1) {
        order.items[itemIndex].status = update.status;
      }
    });
  }

  // Save the updated order
  await order.save();

  // Handle special status updates
  if (status === 'paid') {
    // Update table status if this is a dine-in order
    if (order.orderType === 'dine-in' && order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'needs_cleaning',
        currentOrderId: null
      });
    }
  }

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Apply discount to order
// @route   PUT /api/v1/orders/:id/apply-discount
// @access  Private (waiter, manager)
exports.applyDiscount = catchAsync(async (req, res, next) => {
  const { discountAmount, discountPercentage } = req.body;

  if (discountAmount === undefined && discountPercentage === undefined) {
    return next(new AppError('Vui lòng cung cấp số tiền hoặc phần trăm giảm giá', 400));
  }

  // Find order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order is in a state where discount can be applied
  const allowedStatuses = [
    'pending_confirmation',
    'confirmed_by_customer',
    'partially_served',
    'fully_served',
    'payment_pending'
  ];

  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(new AppError('Không thể áp dụng giảm giá cho đơn hàng này', 400));
  }

  // Check if user is manager if discount is large
  const isLargeDiscount =
    (discountPercentage && discountPercentage > 15) ||
    (discountAmount && discountAmount > order.subTotal * 0.15);

  if (isLargeDiscount && req.user.role !== 'manager') {
    return next(new AppError('Giảm giá lớn chỉ có thể được áp dụng bởi quản lý', 403));
  }

  // Apply the discount
  if (discountPercentage !== undefined) {
    order.discountPercentage = discountPercentage;
    order.discountAmount = order.subTotal * (discountPercentage / 100);
  } else {
    order.discountAmount = discountAmount;
    order.discountPercentage = (discountAmount / order.subTotal) * 100;
  }

  // Recalculate total
  order.totalAmount = order.subTotal - order.discountAmount + order.taxAmount;

  // Save the updated order
  await order.save();

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Process order checkout/payment
// @route   POST /api/v1/orders/:id/checkout
// @access  Private (waiter, manager)
exports.checkoutOrder = catchAsync(async (req, res, next) => {
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return next(new AppError('Vui lòng cung cấp phương thức thanh toán', 400));
  }

  // Find order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order can be checked out
  const allowedStatuses = ['pending_confirmation', 'confirmed_by_customer', 'partially_served', 'fully_served', 'payment_pending'];
  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(new AppError('Không thể thanh toán đơn hàng ở trạng thái này', 400));
  }

  // Update order
  order.paymentMethod = paymentMethod;
  order.paymentStatus = 'paid';
  order.orderStatus = 'paid';

  // Save the updated order
  await order.save();

  // Update table status if this is a dine-in order
  if (order.orderType === 'dine-in' && order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: 'needs_cleaning',
      currentOrderId: null
    });
  }

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'customer', select: 'fullName email' },
    { path: 'items.menuItem', select: 'name category price' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Update item status in order
// @route   PUT /api/v1/orders/:id/update-item-status/:orderItemId
// @access  Private (waiter, manager)
exports.updateOrderItemStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id, orderItemId } = req.params;

  if (!status) {
    return next(new AppError('Vui lòng cung cấp trạng thái mới cho món ăn', 400));
  }

  // Validate status
  const validStatuses = ['pending', 'served', 'cancelled_item'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Trạng thái món ăn không hợp lệ', 400));
  }

  // Find order
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Find item in order
  const itemIndex = order.items.findIndex(
    item => item._id.toString() === orderItemId
  );

  if (itemIndex === -1) {
    return next(new AppError('Không tìm thấy món ăn trong đơn hàng', 404));
  }

  // Update item status
  order.items[itemIndex].status = status;

  // Check if all items are served
  const allServed = order.items.every(item => item.status === 'served');
  const someServed = order.items.some(item => item.status === 'served');

  // Update order status based on item statuses
  if (allServed && ['pending_confirmation', 'confirmed_by_customer'].includes(order.orderStatus)) {
    order.orderStatus = 'fully_served';
  } else if (someServed && ['pending_confirmation', 'confirmed_by_customer'].includes(order.orderStatus)) {
    order.orderStatus = 'partially_served';
  }

  // Save the updated order
  await order.save();

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private (manager)
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order can be deleted
  if (order.orderStatus === 'paid') {
    return next(new AppError('Không thể xóa đơn hàng đã thanh toán', 400));
  }

  // If order is associated with a table, update the table
  if (order.table && order.orderType === 'dine-in') {
    await Table.findByIdAndUpdate(order.table, {
      status: 'available',
      currentOrderId: null
    });
  }

  // Delete the order
  await Order.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Generate order receipt
// @route   GET /api/v1/orders/:id/receipt
// @access  Private (waiter, manager)
exports.generateReceipt = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate([
      { path: 'table', select: 'name location' },
      { path: 'waiter', select: 'fullName' },
      { path: 'customer', select: 'fullName email phoneNumber' },
      { path: 'items.menuItem', select: 'name category price' }
    ]);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Format the order data for the receipt
  const receiptData = {
    orderNumber: order.orderNumber || order._id.toString().substr(-6),
    orderDate: new Date(order.createdAt).toLocaleString('vi-VN'),
    customerName: order.customer ? order.customer.fullName : 'Khách vãng lai',
    tableName: order.table ? order.table.name : 'Không áp dụng',
    waiterName: order.waiter ? order.waiter.fullName : 'Không áp dụng',
    items: order.items.map(item => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.priceAtOrder,
      total: item.quantity * item.priceAtOrder
    })),
    subTotal: order.subTotal,
    discountAmount: order.discountAmount || 0,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod || 'Chưa thanh toán',
    paymentStatus: order.paymentStatus || 'pending',
    orderStatus: order.orderStatus,
    notes: order.orderNotes || ''
  };

  res.status(200).json({
    status: 'success',
    data: {
      receipt: receiptData
    }
  });
});

// @desc    Apply promotion code to order
// @route   PUT /api/v1/orders/:id/apply-promotion
// @access  Private (waiter, manager, customer)
exports.applyPromotion = catchAsync(async (req, res, next) => {
  const { promotionCode } = req.body;

  if (!promotionCode) {
    return next(new AppError('Vui lòng cung cấp mã khuyến mãi', 400));
  }

  // Find order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  // Check if order status allows applying promotion
  const allowedStatuses = [
    'pending_confirmation',
    'confirmed_by_customer',
    'partially_served',
    'fully_served',
    'payment_pending'
  ];

  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(new AppError('Không thể áp dụng khuyến mãi cho đơn hàng này', 400));
  }

  // Check if promotion is already applied
  if (order.appliedPromotion) {
    return next(new AppError('Đơn hàng đã áp dụng mã khuyến mãi khác', 400));
  }

  // Find promotion by code
  const promotion = await Promotion.findOne({
    code: promotionCode.toUpperCase(),
    isActive: true
  });

  if (!promotion) {
    return next(new AppError('Mã khuyến mãi không tồn tại hoặc đã hết hạn', 404));
  }

  try {
    // Apply promotion to order
    await order.applyPromotion(promotion);

    // Increment usage count
    promotion.usageCount += 1;
    await promotion.save();

    // Populate fields for response
    await order.populate([
      { path: 'table', select: 'name location' },
      { path: 'waiter', select: 'fullName' },
      { path: 'appliedPromotion', select: 'name type value' },
      { path: 'items.menuItem', select: 'name category price' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        order,
        promotionApplied: {
          name: promotion.name,
          discountAmount: order.promotionDiscountAmount,
          originalTotal: order.subTotal,
          newTotal: order.totalAmount
        }
      }
    });

  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// @desc    Remove promotion from order
// @route   DELETE /api/v1/orders/:id/remove-promotion
// @access  Private (waiter, manager)
exports.removePromotion = catchAsync(async (req, res, next) => {
  // Find order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng với ID này', 404));
  }

  if (!order.appliedPromotion) {
    return next(new AppError('Đơn hàng chưa áp dụng mã khuyến mãi nào', 400));
  }

  // Get promotion to decrease usage count
  const promotion = await Promotion.findById(order.appliedPromotion);
  if (promotion && promotion.usageCount > 0) {
    promotion.usageCount -= 1;
    await promotion.save();
  }

  // Remove promotion from order
  order.appliedPromotion = undefined;
  order.promotionCode = undefined;
  order.promotionDiscountAmount = 0;

  await order.save();

  // Populate fields for response
  await order.populate([
    { path: 'table', select: 'name location' },
    { path: 'waiter', select: 'fullName' },
    { path: 'items.menuItem', select: 'name category price' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
}); 