const Table = require('../models/Table');
const Booking = require('../models/Booking');

/**
 * Tìm bàn phù hợp với số lượng khách vào thời điểm cụ thể
 * @param {Number} guestCount - Số lượng khách
 * @param {Date} bookingDate - Ngày đặt bàn
 * @param {String} bookingTime - Giờ đặt bàn (format: HH:MM)
 * @returns {Promise<Object>} - Bàn phù hợp nhất hoặc null nếu không tìm thấy
 */
exports.findSuitableTable = async (guestCount, bookingDate, bookingTime) => {
  try {
    // Chuyển đổi bookingDate thành đối tượng Date nếu nó là string
    if (typeof bookingDate === 'string') {
      bookingDate = new Date(bookingDate);
    }
    
    // Lấy tất cả các bàn có trạng thái available và có sức chứa đủ
    const allTables = await Table.find({
      status: 'available',
      capacity: { $gte: guestCount }
    }).sort({ capacity: 1 }); // Sắp xếp theo sức chứa tăng dần để lấy bàn nhỏ nhất phù hợp trước
    
    if (!allTables || allTables.length === 0) {
      console.log(`Không tìm thấy bàn nào có sức chứa đủ cho ${guestCount} khách`);
      return null;
    }
    
    // Kiểm tra xem bàn đã được đặt vào thời điểm cụ thể chưa
    const bookingDateTime = `${bookingDate.toISOString().split('T')[0]}T${bookingTime}:00`;
    const date = new Date(bookingDateTime);
    
    // Tìm bàn phù hợp nhất (bàn có sức chứa gần với số lượng khách nhất)
    let suitableTable = null;
    
    for (const table of allTables) {
      // Kiểm tra xem bàn có được đặt vào thời điểm này không
      const isBooked = await isTableBooked(table._id, date, bookingDate);
      
      if (!isBooked) {
        suitableTable = table;
        break; // Đã tìm thấy bàn phù hợp, thoát vòng lặp
      }
    }
    
    return suitableTable;
  } catch (error) {
    console.error('Lỗi khi tìm bàn phù hợp:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem bàn đã được đặt vào thời điểm cụ thể chưa
 * @param {ObjectId} tableId - ID của bàn
 * @param {Date} dateTime - Thời điểm đặt bàn
 * @param {Date} bookingDate - Ngày đặt bàn
 * @returns {Promise<Boolean>} - true nếu bàn đã được đặt, false nếu chưa
 */
const isTableBooked = async (tableId, dateTime, bookingDate) => {
  const date = new Date(dateTime);
  const bookingDateStr = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Lấy giờ và phút từ dateTime
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const bookingTime = `${hours}:${minutes}`;
  
  // Tìm các đặt bàn cho bàn này vào ngày cụ thể
  const bookings = await Booking.find({
    tableAssigned: tableId,
    date: bookingDate,
    status: { $in: ['pending', 'confirmed'] }
  });
  
  // Kiểm tra xem có đặt bàn nào trong khoảng thời gian 45 phút trước hoặc sau không
  for (const booking of bookings) {
    const [bookingHour, bookingMinute] = booking.time.split(':').map(Number);
    const bookingTimeInMinutes = bookingHour * 60 + bookingMinute;
    
    const [requestHour, requestMinute] = bookingTime.split(':').map(Number);
    const requestTimeInMinutes = requestHour * 60 + requestMinute;
    
    const timeDifferenceInMinutes = Math.abs(bookingTimeInMinutes - requestTimeInMinutes);
    
    // Nếu đặt bàn trong khoảng 45 phút, coi như bàn đã được đặt
    if (timeDifferenceInMinutes <= 45) {
      return true;
    }
  }
  
  return false;
};

/**
 * Cập nhật trạng thái bàn
 * @param {ObjectId} tableId - ID của bàn
 * @param {String} status - Trạng thái mới ('available', 'occupied', 'reserved', 'unavailable', 'needs_cleaning')
 * @returns {Promise<Object>} - Bàn đã cập nhật
 */
exports.updateTableStatus = async (tableId, status) => {
  try {
    return await Table.findByIdAndUpdate(
      tableId,
      { status },
      { new: true }
    );
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bàn:', error);
    throw error;
  }
}; 