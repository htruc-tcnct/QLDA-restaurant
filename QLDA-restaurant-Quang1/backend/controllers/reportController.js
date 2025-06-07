const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Booking = require('../models/Booking');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper function to get date ranges
const getDateRanges = () => {
  const now = new Date();
  
  // Today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  // Last 7 days
  const startOfLast7Days = new Date(now);
  startOfLast7Days.setDate(now.getDate() - 6);
  startOfLast7Days.setHours(0, 0, 0, 0);
  
  // This month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // This year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  
  return {
    today: { start: startOfToday, end: endOfToday },
    last7Days: { start: startOfLast7Days, end: endOfToday },
    thisMonth: { start: startOfMonth, end: endOfMonth },
    thisYear: { start: startOfYear, end: endOfYear }
  };
};

// @desc    Get sales summary (today, last 7 days, this month, this year)
// @route   GET /api/v1/reports/sales-summary
// @access  Private (manager)
exports.getSalesSummary = catchAsync(async (req, res, next) => {
  const dateRanges = getDateRanges();
  
  // Get sales for each time period
  const todaySales = await getSalesForPeriod(dateRanges.today.start, dateRanges.today.end);
  const last7DaysSales = await getSalesForPeriod(dateRanges.last7Days.start, dateRanges.last7Days.end);
  const thisMonthSales = await getSalesForPeriod(dateRanges.thisMonth.start, dateRanges.thisMonth.end);
  const thisYearSales = await getSalesForPeriod(dateRanges.thisYear.start, dateRanges.thisYear.end);
  
  res.status(200).json({
    status: 'success',
    data: {
      today: todaySales,
      last7Days: last7DaysSales,
      thisMonth: thisMonthSales,
      thisYear: thisYearSales
    }
  });
});

// Helper function to get sales for a specific period
const getSalesForPeriod = async (startDate, endDate) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        customerCount: { $addToSet: '$customer' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSales: 1,
        orderCount: 1,
        customerCount: { $size: '$customerCount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { totalSales: 0, orderCount: 0, customerCount: 0 };
};

// @desc    Get sales over time (grouped by day, week, or month)
// @route   GET /api/v1/reports/sales-over-time
// @access  Private (manager)
exports.getSalesOverTime = catchAsync(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc', 400));
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  // Build grouping expression based on groupBy parameter
  let groupByExpression;
  let dateFormat;
  
  switch (groupBy) {
    case 'week':
      groupByExpression = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      dateFormat = '%Y-W%U';
      break;
    case 'month':
      groupByExpression = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      dateFormat = '%Y-%m';
      break;
    default: // day
      groupByExpression = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = '%Y-%m-%d';
  }
  
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: groupByExpression,
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        date: { $first: '$createdAt' }
      }
    },
    {
      $sort: { date: 1 }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: { format: dateFormat, date: '$date' }
        },
        totalSales: 1,
        orderCount: 1
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      startDate: start,
      endDate: end,
      groupBy,
      salesData: result
    }
  });
});

// @desc    Get top selling items
// @route   GET /api/v1/reports/top-selling-items
// @access  Private (manager)
exports.getTopSellingItems = catchAsync(async (req, res, next) => {
  const { startDate, endDate, limit = 10 } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc', 400));
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        paymentStatus: 'paid'
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.menuItem',
        totalQuantity: { $sum: '$items.quantity' },
        totalSales: { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: parseInt(limit)
    },
    {
      $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: '_id',
        as: 'menuItemDetails'
      }
    },
    {
      $unwind: '$menuItemDetails'
    },
    {
      $project: {
        _id: 0,
        menuItemId: '$_id',
        name: '$menuItemDetails.name',
        category: '$menuItemDetails.category',
        totalQuantity: 1,
        totalSales: 1,
        imageUrl: { $arrayElemAt: ['$menuItemDetails.imageUrls', 0] }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      startDate: start,
      endDate: end,
      items: result
    }
  });
});

// @desc    Get sales by category
// @route   GET /api/v1/reports/category-sales
// @access  Private (manager)
exports.getCategorySales = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc', 400));
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        paymentStatus: 'paid'
      }
    },
    {
      $unwind: '$items'
    },
    {
      $lookup: {
        from: 'menuitems',
        localField: 'items.menuItem',
        foreignField: '_id',
        as: 'menuItemDetails'
      }
    },
    {
      $unwind: '$menuItemDetails'
    },
    {
      $group: {
        _id: '$menuItemDetails.category',
        totalSales: { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } },
        itemCount: { $sum: '$items.quantity' }
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalSales: 1,
        itemCount: 1
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      startDate: start,
      endDate: end,
      categories: result
    }
  });
});

// @desc    Get booking statistics
// @route   GET /api/v1/reports/booking-stats
// @access  Private (manager)
exports.getBookingStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc', 400));
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  // Count bookings by status
  const statusCounts = await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1
      }
    }
  ]);
  
  // Get booking trends by day
  const bookingTrends = await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$bookingDate' },
          month: { $month: '$bookingDate' },
          day: { $dayOfMonth: '$bookingDate' }
        },
        confirmed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
          }
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
          }
        },
        noShow: {
          $sum: {
            $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0]
          }
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        date: { $first: '$bookingDate' }
      }
    },
    {
      $sort: { date: 1 }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        confirmed: 1,
        cancelled: 1,
        noShow: 1,
        completed: 1,
        total: { $add: ['$confirmed', '$cancelled', '$noShow', '$completed'] }
      }
    }
  ]);
  
  // Calculate totals
  const totalStats = {
    total: 0,
    confirmed: 0,
    cancelled: 0,
    noShow: 0,
    completed: 0
  };
  
  statusCounts.forEach(item => {
    totalStats[item.status] = item.count;
    totalStats.total += item.count;
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      startDate: start,
      endDate: end,
      summary: totalStats,
      statusCounts,
      trends: bookingTrends
    }
  });
});

// @desc    Get staff performance
// @route   GET /api/v1/reports/staff-performance
// @access  Private (manager)
exports.getStaffPerformance = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc', 400));
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        waiter: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$waiter',
        totalOrders: { $sum: 1 },
        totalSales: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ['$orderStatus', 'paid'] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'waiterDetails'
      }
    },
    {
      $unwind: '$waiterDetails'
    },
    {
      $project: {
        _id: 0,
        waiterId: '$_id',
        name: '$waiterDetails.fullName',
        email: '$waiterDetails.email',
        totalOrders: 1,
        totalSales: 1,
        avgOrderValue: 1,
        completedOrders: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedOrders', '$totalOrders'] },
            100
          ]
        }
      }
    },
    {
      $sort: { totalSales: -1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      startDate: start,
      endDate: end,
      staff: result
    }
  });
}); 