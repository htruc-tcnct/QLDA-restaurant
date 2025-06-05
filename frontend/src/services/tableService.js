import api from "./api";

// Get all tables
export const getAllTables = async (filters = {}) => {
  let queryString = "";

  if (filters.status) {
    queryString += `status=${filters.status}&`;
  }

  if (filters.location) {
    queryString += `location=${filters.location}&`;
  }

  if (filters.capacity) {
    queryString += `capacity=${filters.capacity}&`;
  }

  // Add dateTime filter if provided to check for bookings
  if (filters.dateTime) {
    queryString += `dateTime=${filters.dateTime}&`;
  }

  const url = `/api/v1/tables${queryString ? "?" + queryString : ""}`;
  return await api.get(url);
};

// Get table by ID
export const getTableById = async (id) => {
  return await api.get(`/api/v1/tables/${id}`);
};

// Create new table
export const createTable = async (tableData) => {
  return await api.post("/api/v1/tables", tableData);
};

// Update table
export const updateTable = async (id, tableData) => {
  return await api.put(`/api/v1/tables/${id}`, tableData);
};

// Update table status
export const updateTableStatus = async (id, status, reservationInfo = null) => {
  const data = { status };
  if (reservationInfo) {
    data.reservationInfo = reservationInfo;
  }
  return await api.put(`/api/v1/tables/${id}/status`, data);
};

// Delete table
export const deleteTable = async (id) => {
  return await api.delete(`/api/v1/tables/${id}`);
};

// Get available tables for booking
export const getAvailableTablesForBooking = async (dateTime, partySize) => {
  return await api.get(
    `/api/v1/tables/available?dateTime=${dateTime}&partySize=${partySize}`
  );
};

// Check if a table is available at a specific time
export const checkTableAvailability = async (tableId, dateTime) => {
  return await api.get(
    `/api/v1/tables/check-availability?tableId=${tableId}&dateTime=${dateTime}`
  );
};

// Get all tables with booking information for a specific time
export const getTablesWithBookingInfo = async (dateTime) => {
  return await getAllTables({ dateTime });
};

// Reserve table
export const reserveTable = async (id, reservationInfo) => {
  return await api.put(`/api/v1/tables/${id}/reserve`, reservationInfo);
};

// Mark table as occupied
export const markTableAsOccupied = async (id, orderId = null) => {
  const data = { status: "occupied" };
  if (orderId) {
    data.currentOrderId = orderId;
  }
  return await api.put(`/api/v1/tables/${id}/status`, data);
};

// Mark table as available
export const markTableAsAvailable = async (id) => {
  return await api.put(`/api/v1/tables/${id}/status`, { status: "available" });
};

// Mark table as needs cleaning
export const markTableAsNeedsCleaning = async (id) => {
  return await api.put(`/api/v1/tables/${id}/status`, {
    status: "needs_cleaning",
  });
};

// Mark table as reserved
export const markTableAsReserved = async (id, bookingId = null) => {
  const data = { status: "reserved" };
  if (bookingId) {
    data.bookingId = bookingId;
  }
  console.log(
    `Calling markTableAsReserved for table ${id} with booking ${bookingId}`,
    data
  );
  return await api.put(`/api/v1/tables/${id}/reserve`, data);
};

// Get upcoming reservations for a table (within next 2 hours)
export const getUpcomingReservations = async (id) => {
  return await api.get(`/api/v1/tables/${id}/upcoming-reservations`);
};

export default {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getAvailableTablesForBooking,
  checkTableAvailability,
  getTablesWithBookingInfo,
  reserveTable,
  markTableAsOccupied,
  markTableAsAvailable,
  markTableAsNeedsCleaning,
  markTableAsReserved,
  getUpcomingReservations,
};
