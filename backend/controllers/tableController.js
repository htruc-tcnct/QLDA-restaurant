const Table = require("../models/Table");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Helper function to check if a table is booked at a specific time
const isTableBookedAt = async (tableId, dateTime) => {
  const date = new Date(dateTime);
  const bookingDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

  // Get the time in HH:MM format
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const bookingTime = `${hours}:${minutes}`;

  console.log(
    `Checking if table ${tableId} is booked at ${bookingDate} ${bookingTime}`
  );

  // Check if there are any bookings for this table around the specified time
  // For testing purposes, we're using a smaller window of 15 minutes instead of 45
  const bookings = await Booking.find({
    tableAssigned: tableId,
    date: new Date(bookingDate),
    status: { $in: ["pending", "confirmed"] },
  });

  console.log(`Found ${bookings.length} bookings for this table on this date`);

  // Check if any booking time is within 15 minutes of the requested time (for testing)
  if (bookings.length > 0) {
    for (const booking of bookings) {
      const [bookingHour, bookingMinute] = booking.time.split(":").map(Number);
      const bookingTimeInMinutes = bookingHour * 60 + bookingMinute;

      const [requestHour, requestMinute] = bookingTime.split(":").map(Number);
      const requestTimeInMinutes = requestHour * 60 + requestMinute;

      const timeDifferenceInMinutes = Math.abs(
        bookingTimeInMinutes - requestTimeInMinutes
      );

      console.log(
        `Booking time: ${booking.time}, Request time: ${bookingTime}, Difference: ${timeDifferenceInMinutes} minutes`
      );

      // If the booking is within 15 minutes, consider the table booked (reduced from 45 for testing)
      if (timeDifferenceInMinutes <= 15) {
        console.log(
          `Table ${tableId} is already booked within 15 minutes of the requested time`
        );
        return {
          isBooked: true,
          booking: booking,
          timeDifference: timeDifferenceInMinutes,
        };
      }
    }
  }

  console.log(`Table ${tableId} is available at the requested time`);
  return { isBooked: false };
};

// @desc    Get all tables
// @route   GET /api/v1/tables
// @access  Private (waiter, manager, chef)
exports.getAllTables = catchAsync(async (req, res, next) => {
  // Build filter object
  const filter = {};

  // Filter by status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by location if provided
  if (req.query.location) {
    // Use regex for partial matching
    filter.location = { $regex: req.query.location, $options: "i" };
  }

  // Execute query
  const tables = await Table.find(filter).sort({ name: 1 });

  // If a dateTime parameter is provided, check for bookings
  if (req.query.dateTime) {
    const dateTime = new Date(req.query.dateTime);

    // Check each table for bookings at the specified time
    for (let i = 0; i < tables.length; i++) {
      const bookingStatus = await isTableBookedAt(tables[i]._id, dateTime);
      tables[i] = tables[i].toObject(); // Convert to plain object to add custom properties
      tables[i].isBookedAt = bookingStatus.isBooked;
      if (bookingStatus.isBooked) {
        tables[i].bookingInfo = bookingStatus.booking;
      }
    }
  }

  res.status(200).json({
    status: "success",
    results: tables.length,
    data: {
      tables,
    },
  });
});

// @desc    Get single table
// @route   GET /api/v1/tables/:id
// @access  Private (waiter, manager, chef)
exports.getTable = catchAsync(async (req, res, next) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // If table has current order, populate it
  if (table.currentOrderId) {
    await table.populate("currentOrderId");
  }

  res.status(200).json({
    status: "success",
    data: {
      table,
    },
  });
});

// @desc    Create new table
// @route   POST /api/v1/tables
// @access  Private (manager)
exports.createTable = catchAsync(async (req, res, next) => {
  const { name, capacity, status, location } = req.body;

  // Basic validation
  if (!name || !capacity) {
    return next(new AppError("Vui lòng cung cấp tên và sức chứa của bàn", 400));
  }

  // Create new table
  const newTable = await Table.create({
    name,
    capacity,
    status: status || "available",
    location: location || "",
    currentOrderId: null,
  });

  res.status(201).json({
    status: "success",
    data: {
      table: newTable,
    },
  });
});

// @desc    Update table
// @route   PUT /api/v1/tables/:id
// @access  Private (manager)
exports.updateTable = catchAsync(async (req, res, next) => {
  const { name, capacity, location } = req.body;

  // Find table first to check if it exists
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // Update the table
  const updatedTable = await Table.findByIdAndUpdate(
    req.params.id,
    { name, capacity, location },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      table: updatedTable,
    },
  });
});

// @desc    Delete table
// @route   DELETE /api/v1/tables/:id
// @access  Private (manager)
exports.deleteTable = catchAsync(async (req, res, next) => {
  // Find table first to check if it exists and has ongoing orders
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // Check if table has an active order
  if (table.currentOrderId) {
    return next(
      new AppError("Không thể xóa bàn đang có đơn hàng đang phục vụ", 400)
    );
  }

  // Check if table is reserved
  if (table.status === "reserved") {
    return next(new AppError("Không thể xóa bàn đang được đặt trước", 400));
  }

  // Delete the table
  await Table.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc    Update table status
// @route   PUT /api/v1/tables/:id/status
// @access  Private (waiter, manager)
exports.updateTableStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  // Validate status
  if (!status) {
    return next(new AppError("Vui lòng cung cấp trạng thái mới", 400));
  }

  // Find table first to check if it exists
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // Handle special status transitions
  let updateData = { status };

  // If changing to available, clear the currentOrderId
  if (status === "available") {
    updateData.currentOrderId = null;
  }

  // Update the table
  const updatedTable = await Table.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      table: updatedTable,
    },
  });
});

// @desc    Clear table (set to available)
// @route   PUT /api/v1/tables/:id/clear
// @access  Private (waiter, manager)
exports.clearTable = catchAsync(async (req, res, next) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // Only clear tables that are occupied or needs_cleaning
  if (!["occupied", "needs_cleaning"].includes(table.status)) {
    return next(
      new AppError("Chỉ có thể dọn bàn đang được sử dụng hoặc cần dọn dẹp", 400)
    );
  }

  // Update table status
  table.status = "available";
  table.currentOrderId = null;

  await table.save();

  res.status(200).json({
    status: "success",
    data: {
      table,
    },
  });
});

// @desc    Check table availability for a specific time
// @route   GET /api/v1/tables/check-availability
// @access  Private (waiter, manager)
exports.checkTableAvailability = catchAsync(async (req, res, next) => {
  const { tableId, dateTime } = req.query;

  if (!tableId || !dateTime) {
    return next(new AppError("Vui lòng cung cấp ID bàn và thời gian", 400));
  }

  const table = await Table.findById(tableId);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  const bookingStatus = await isTableBookedAt(tableId, dateTime);

  res.status(200).json({
    status: "success",
    data: {
      table,
      isAvailable: !bookingStatus.isBooked,
      bookingInfo: bookingStatus.isBooked ? bookingStatus.booking : null,
    },
  });
});

// @desc    Get available tables for booking
// @route   GET /api/v1/tables/available
// @access  Public
exports.getAvailableTables = catchAsync(async (req, res, next) => {
  const { dateTime, partySize } = req.query;

  if (!dateTime) {
    return next(new AppError("Vui lòng cung cấp thời gian đặt bàn", 400));
  }

  // Find tables with sufficient capacity
  const capacityFilter = {};
  if (partySize) {
    capacityFilter.capacity = { $gte: parseInt(partySize) };
  }

  const tables = await Table.find({
    ...capacityFilter,
    status: { $ne: "unavailable" }, // Exclude unavailable tables
  }).sort({ capacity: 1 });

  console.log(`Found ${tables.length} tables with sufficient capacity`);

  // Check each table for bookings at the specified time
  const availableTables = [];
  const unavailableTables = [];

  for (const table of tables) {
    const bookingStatus = await isTableBookedAt(table._id, dateTime);

    if (!bookingStatus.isBooked) {
      availableTables.push(table);
    } else {
      // Add information about why the table is unavailable
      const tableWithInfo = table.toObject();
      tableWithInfo.unavailableReason = "conflict";
      tableWithInfo.conflictBooking = {
        time: bookingStatus.booking.time,
        timeDifference: bookingStatus.timeDifference,
        customerName: bookingStatus.booking.customerName,
      };
      unavailableTables.push(tableWithInfo);
    }
  }

  console.log(
    `Available tables: ${availableTables.length}, Unavailable due to conflicts: ${unavailableTables.length}`
  );

  res.status(200).json({
    status: "success",
    results: availableTables.length,
    data: {
      tables: availableTables,
      unavailableTables: unavailableTables,
    },
  });
});

// @desc    Mark table as reserved for a specific booking
// @route   PUT /api/v1/tables/:id/reserve
// @access  Private (waiter, manager)
exports.markTableAsReserved = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  // Find table first to check if it exists
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // Check if table is already reserved or occupied
  if (table.status === "occupied") {
    return next(
      new AppError("Bàn đang được sử dụng, không thể đặt trước", 400)
    );
  }

  // If bookingId is provided, get the booking details to check for time conflicts
  if (bookingId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Không tìm thấy đặt bàn với ID này", 404));
    }

    // Format the dateTime for conflict checking
    const bookingDateTime = `${booking.date.toISOString().split("T")[0]}T${
      booking.time
    }:00`;
    console.log(`Checking conflicts for booking at ${bookingDateTime}`);

    // Check if there are any conflicts with other bookings
    const bookingStatus = await isTableBookedAt(req.params.id, bookingDateTime);

    // If there's a conflict and it's not with the current booking
    if (
      bookingStatus.isBooked &&
      bookingStatus.booking._id.toString() !== bookingId
    ) {
      return next(
        new AppError(
          `Bàn này đã được đặt trong khoảng thời gian ${bookingStatus.timeDifference} phút so với thời gian bạn chọn. Vui lòng chọn bàn khác hoặc thay đổi thời gian.`,
          400
        )
      );
    }
  }

  console.log(
    `Marking table ${table.name} (${table._id}) as reserved for booking ${bookingId}`
  );

  // Update the table status to reserved
  const updatedTable = await Table.findByIdAndUpdate(
    req.params.id,
    {
      status: "reserved",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // If bookingId is provided, update the booking with this table
  if (bookingId) {
    await Booking.findByIdAndUpdate(
      bookingId,
      { tableAssigned: req.params.id },
      { new: true }
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      table: updatedTable,
    },
  });
});

// @desc    Check for upcoming reservations for a table
// @route   GET /api/v1/tables/:id/upcoming-reservations
// @access  Private (waiter, manager)
exports.getUpcomingReservations = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find table first to check if it exists
  const table = await Table.findById(id);

  if (!table) {
    return next(new AppError("Không tìm thấy bàn với ID này", 404));
  }

  // Get current date and time
  const now = new Date();
  const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Find bookings for this table that are scheduled for today and in the future
  const bookings = await Booking.find({
    tableAssigned: id,
    date: { $gte: new Date(currentDate) },
    status: { $in: ["pending", "confirmed"] },
  }).sort({ date: 1, time: 1 });

  // Filter bookings that are within the next 24 hours (increased from 2 hours for testing)
  const upcomingBookings = [];
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  for (const booking of bookings) {
    // Create a Date object for the booking time
    const bookingDateTime = new Date(
      `${booking.date.toISOString().split("T")[0]}T${booking.time}`
    );

    // Calculate time difference in milliseconds
    const timeDifferenceMs = bookingDateTime - now;

    // If the booking is in the future and within 24 hours
    if (timeDifferenceMs > 0 && timeDifferenceMs <= twentyFourHoursInMs) {
      // Calculate minutes until the booking
      const minutesUntil = Math.floor(timeDifferenceMs / (60 * 1000));

      upcomingBookings.push({
        ...booking.toObject(),
        minutesUntil,
        hoursUntil: (minutesUntil / 60).toFixed(1),
      });
    }
  }

  res.status(200).json({
    status: "success",
    results: upcomingBookings.length,
    data: {
      upcomingBookings,
    },
  });
});
