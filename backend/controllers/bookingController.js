const Booking = require("../models/Booking");
const Table = require("../models/Table");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

// Utility function to check if restaurant is open at the given time
const isRestaurantOpenAt = (time) => {
  // For testing purposes, always return true to allow bookings at any time
  return true;

  /* Original implementation - commented out for testing
  // Convert time string to hours and minutes
  const [hours, minutes] = time.split(':').map(Number);
  
  // Example restaurant hours: 10:00 - 22:00
  const openingHour = 10;
  const closingHour = 22;
  
  return hours >= openingHour && hours < closingHour;
  */
};

// Create a new booking
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    date,
    time,
    numberOfGuests,
    notes,
    preOrderedItems,
  } = req.body;

  // Validate required fields
  if (!customerName || !customerPhone || !date || !time || !numberOfGuests) {
    return next(new AppError("Vui lòng điền đầy đủ thông tin bắt buộc", 400));
  }

  // Check if restaurant is open at the requested time
  if (!isRestaurantOpenAt(time)) {
    return next(new AppError("Nhà hàng không mở cửa vào thời gian này", 400));
  }

  // If user is logged in, associate the booking with their account
  const bookingData = {
    customerName,
    customerPhone,
    customerEmail,
    date,
    time,
    numberOfGuests,
    notes,
    preOrderedItems,
  };

  if (req.user) {
    bookingData.customer = req.user._id;
  }
  // Bước 1: Tìm bàn trống có đủ chỗ ngồi cho khách
  let selectedTable = await Table.findOne({
    status: "available",
    capacity: { $gte: numberOfGuests },
  }).sort("capacity"); // Sắp xếp theo sức chứa để lấy bàn phù hợp nhất

  // Bước 2: Nếu không có bàn trống, tìm bàn có trạng thái reserved với:
  // - Ngày khác với đặt bàn hiện tại, HOẶC
  // - Cùng ngày nhưng thời gian cách nhau ít nhất 1 giờ (để có thời gian dọn dẹp và chuẩn bị)
  if (!selectedTable) {
    console.log(
      "Không tìm thấy bàn trống, tìm kiếm bàn đã đặt nhưng có thể dùng cho đặt chỗ này"
    );

    // Lấy tất cả các bàn đã đặt trước với đủ sức chứa
    const reservedTables = await Table.find({
      status: "reserved",
      capacity: { $gte: numberOfGuests },
    }).sort("capacity");

    // Kiểm tra từng bàn đã đặt trước xem có thể dùng cho đặt chỗ mới không
    for (const table of reservedTables) {
      // Tìm tất cả các đặt chỗ hiện tại cho bàn này
      const existingBookings = await Booking.find({
        tableAssigned: table._id,
        status: { $in: ["pending", "confirmed"] },
      });

      let canUseTable = true;

      // Chuyển đổi ngày và giờ đặt bàn mới thành đối tượng Date để so sánh
      const newBookingDate = new Date(date);
      const [newBookingHour, newBookingMinute] = time.split(":").map(Number);
      const newBookingTimeInMinutes = newBookingHour * 60 + newBookingMinute;

      // Kiểm tra từng đặt chỗ hiện tại
      for (const booking of existingBookings) {
        const existingBookingDate = new Date(booking.date);

        // So sánh ngày: nếu khác ngày thì có thể dùng bàn này
        const isSameDate =
          existingBookingDate.getFullYear() === newBookingDate.getFullYear() &&
          existingBookingDate.getMonth() === newBookingDate.getMonth() &&
          existingBookingDate.getDate() === newBookingDate.getDate();

        if (isSameDate) {
          // Nếu cùng ngày, kiểm tra thời gian có cách nhau ít nhất 1 giờ không
          const [existingHour, existingMinute] = booking.time
            .split(":")
            .map(Number);
          const existingTimeInMinutes = existingHour * 60 + existingMinute;

          const timeDifference = Math.abs(
            existingTimeInMinutes - newBookingTimeInMinutes
          );

          if (timeDifference < 60) {
            // Nếu cách nhau ít hơn 1 giờ
            console.log(
              `Không thể dùng bàn ${table.name} vì đã có đặt chỗ vào ${booking.time} (chênh lệch ${timeDifference} phút)`
            );
            canUseTable = false;
            break;
          }
        }
      }

      if (canUseTable) {
        console.log(
          `Có thể dùng bàn ${table.name} đã đặt trước vì không có xung đột thời gian`
        );
        selectedTable = table;
        break;
      }
    }
  }

  // Nếu tìm được bàn phù hợp (trống hoặc đã đặt trước nhưng có thể dùng được)
  if (selectedTable) {
    bookingData.tableAssigned = selectedTable._id;
    bookingData.status = "confirmed"; // Xác nhận đặt bàn ngay vì đã tìm được bàn

    // Cập nhật trạng thái bàn thành reserved (nếu chưa phải reserved)
    if (selectedTable.status !== "reserved") {
      await Table.findByIdAndUpdate(selectedTable._id, { status: "reserved" });
    }

    console.log(
      `Đã gán bàn ${selectedTable.name} cho đặt chỗ và đảm bảo trạng thái là reserved`
    );
  } else {
    console.log("Không tìm thấy bàn phù hợp nào, đặt chỗ ở trạng thái pending");
  }

  const booking = await Booking.create(bookingData);

  res.status(201).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Get all bookings for the logged-in customer
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .sort({ date: -1, time: -1 })
    .populate({
      path: "preOrderedItems.menuItem",
      select: "name price",
    });

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

// Get all bookings (for staff/admin)
exports.getAllBookings = catchAsync(async (req, res, next) => {
  // Build query
  const query = {};

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  } else if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    query.date = {
      $gte: date,
      $lt: nextDay,
    };
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search by customer name or phone
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    query.$or = [{ customerName: searchRegex }, { customerPhone: searchRegex }];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .sort({ date: -1, time: -1 })
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: "customer",
        select: "name email",
      },
      {
        path: "tableAssigned",
        select: "name capacity",
      },
      {
        path: "assignedStaff",
        select: "name",
      },
      {
        path: "preOrderedItems.menuItem",
        select: "name price",
      },
    ]);

  // Get total count for pagination
  const total = await Booking.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: bookings.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      bookings,
    },
  });
});

// Get a single booking by ID
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate([
    {
      path: "customer",
      select: "name email",
    },
    {
      path: "tableAssigned",
      select: "name capacity",
    },
    {
      path: "assignedStaff",
      select: "name",
    },
    {
      path: "preOrderedItems.menuItem",
      select: "name price imageUrls",
    },
  ]);

  if (!booking) {
    return next(new AppError("Không tìm thấy đặt chỗ với ID này", 404));
  }

  // Check if the user is authorized to view this booking
  if (
    req.user.role === "customer" &&
    (!booking.customer ||
      booking.customer._id.toString() !== req.user._id.toString())
  ) {
    return next(new AppError("Bạn không có quyền xem đặt chỗ này", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Update booking status (for staff/admin)
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  console.log(">>>>>>>>>>>>: ", req.params);
  const { status, tableAssigned, assignedStaff } = req.body;

  if (!status) {
    return next(new AppError("Vui lòng cung cấp trạng thái mới", 400));
  }

  const updateData = { status };

  if (tableAssigned) {
    // Check if tableAssigned is a string (like "table2") and handle accordingly
    if (
      typeof tableAssigned === "string" &&
      !mongoose.Types.ObjectId.isValid(tableAssigned)
    ) {
      // Try to find the table by tableNumber
      const table = await Table.findOne({ tableNumber: tableAssigned });

      if (table) {
        updateData.tableAssigned = table._id;
      } else {
        // Create a new table if it doesn't exist
        const newTable = await Table.create({
          tableNumber: tableAssigned,
          name: `Table ${tableAssigned.replace("table", "")}`,
          capacity: 4, // Default capacity
        });

        updateData.tableAssigned = newTable._id;
      }
    } else {
      // It's already a valid ObjectId, use as is
      updateData.tableAssigned = tableAssigned;
    }
  }

  if (assignedStaff) {
    updateData.assignedStaff = assignedStaff;
  }

  const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    return next(new AppError("Không tìm thấy đặt chỗ với ID này", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Cancel booking by customer
exports.cancelBookingByCustomer = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("Không tìm thấy đặt chỗ với ID này", 404));
  }

  // Check if the booking belongs to the logged-in user
  if (
    !booking.customer ||
    booking.customer.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Bạn không có quyền hủy đặt chỗ này", 403));
  }

  // Check if the booking is in a status that can be cancelled
  if (!["pending_confirmation", "confirmed"].includes(booking.status)) {
    return next(
      new AppError("Đặt chỗ này không thể hủy do đã có trạng thái khác", 400)
    );
  }

  // Check if the booking is within the cancellation policy timeframe
  const bookingDate = new Date(
    `${booking.date.toDateString()} ${booking.time}`
  );
  const now = new Date();
  const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);

  // Example policy: Can cancel up to 2 hours before the booking time
  if (hoursDifference < 2) {
    return next(
      new AppError("Đặt chỗ chỉ có thể hủy ít nhất 2 giờ trước giờ đặt", 400)
    );
  }

  booking.status = "cancelled_by_customer";
  await booking.save();

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Update booking details (for staff/admin)
exports.updateBooking = catchAsync(async (req, res, next) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    date,
    time,
    numberOfGuests,
    notes,
    restaurantNotes,
    tableId, // Changed from tableAssigned to be consistent with frontend
    status,
    assignedStaff,
    preOrderedItems,
  } = req.body;

  // Get the current booking to compare changes
  const currentBooking = await Booking.findById(req.params.id);
  if (!currentBooking) {
    return next(new AppError("Không tìm thấy đặt chỗ với ID này", 404));
  }

  const updateData = {};

  // Only update fields that are provided
  if (customerName) updateData.customerName = customerName;
  if (customerPhone) updateData.customerPhone = customerPhone;
  if (customerEmail) updateData.customerEmail = customerEmail;
  if (date) updateData.date = date;
  if (time) updateData.time = time;
  if (numberOfGuests) updateData.numberOfGuests = numberOfGuests;
  if (notes) updateData.notes = notes;
  if (status) updateData.status = status;
  if (restaurantNotes) updateData.restaurantNotes = restaurantNotes;

  // Check for time conflicts if table, date or time is being updated
  if (
    tableId &&
    (date ||
      time ||
      !currentBooking.tableAssigned ||
      tableId !== currentBooking.tableAssigned.toString())
  ) {
    console.log("Checking for time conflicts with table", tableId);

    // Verify that the table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return next(new AppError("Không tìm thấy bàn với ID này", 404));
    }

    // Format the dateTime for conflict checking
    const bookingDate =
      date ||
      (currentBooking.date
        ? currentBooking.date.toISOString().split("T")[0]
        : null);
    const bookingTime = time || currentBooking.time;

    if (!bookingDate || !bookingTime) {
      return next(new AppError("Cần cung cấp ngày và giờ đặt bàn", 400));
    }

    const bookingDateTime = `${bookingDate}T${bookingTime}:00`;
    console.log(`Checking conflicts for booking at ${bookingDateTime}`);

    // Check if there are any conflicts with other bookings
    const isTableBookedAt = async (tableId, dateTime) => {
      const date = new Date(dateTime);
      const bookingDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

      // Get the time in HH:MM format
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const bookingTime = `${hours}:${minutes}`;

      // Check if there are any bookings for this table around the specified time
      // We consider a booking valid if it's within 45 minutes before or after
      const bookings = await Booking.find({
        tableAssigned: tableId,
        date: new Date(bookingDate),
        status: { $in: ["pending", "confirmed"] },
        _id: { $ne: req.params.id }, // Exclude the current booking
      });

      // Check if any booking time is within 45 minutes of the requested time
      for (const booking of bookings) {
        const [bookingHour, bookingMinute] = booking.time
          .split(":")
          .map(Number);
        const bookingTimeInMinutes = bookingHour * 60 + bookingMinute;

        const [requestHour, requestMinute] = bookingTime.split(":").map(Number);
        const requestTimeInMinutes = requestHour * 60 + requestMinute;

        const timeDifferenceInMinutes = Math.abs(
          bookingTimeInMinutes - requestTimeInMinutes
        );

        console.log(
          `Booking time: ${booking.time}, Request time: ${bookingTime}, Difference: ${timeDifferenceInMinutes} minutes`
        ); // If the booking is within 60 minutes (1 hour), consider the table booked
        if (timeDifferenceInMinutes < 60) {
          return {
            isBooked: true,
            booking: booking,
            timeDifference: timeDifferenceInMinutes,
          };
        }
      }

      return { isBooked: false };
    };

    const bookingStatus = await isTableBookedAt(tableId, bookingDateTime);

    if (bookingStatus.isBooked) {
      return next(
        new AppError(
          `Bàn này đã được đặt trong khoảng thời gian ${bookingStatus.timeDifference} phút so với thời gian bạn chọn. Vui lòng chọn bàn khác hoặc thay đổi thời gian.`,
          400
        )
      );
    }

    // If no conflicts, update the table assignment
    updateData.tableAssigned = tableId;
  }

  if (assignedStaff) updateData.assignedStaff = assignedStaff;
  if (preOrderedItems) updateData.preOrderedItems = preOrderedItems;

  console.log("Updating booking with data:", updateData);
  const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    return next(new AppError("Không tìm thấy đặt chỗ với ID này", 404));
  }

  // If status is confirmed and table is assigned, mark the table as reserved
  if (booking.status === "confirmed" && booking.tableAssigned) {
    try {
      console.log(
        `Marking table ${booking.tableAssigned} as reserved for booking ${booking._id}`
      );
      await Table.findByIdAndUpdate(
        booking.tableAssigned,
        { status: "reserved" },
        { new: true }
      );
    } catch (error) {
      console.error("Error marking table as reserved:", error);
      // Don't fail the request if this fails
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});
