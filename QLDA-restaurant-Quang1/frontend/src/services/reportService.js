import api from './api';

// Get sales summary (today, last 7 days, this month, this year)
export const getSalesSummary = async () => {
  const response = await api.get('/api/v1/reports/sales-summary');
  return response.data;
};

// Get sales over time with grouping options
export const getSalesOverTime = async (startDate, endDate, groupBy = 'day') => {
  const response = await api.get('/api/v1/reports/sales-over-time', {
    params: { startDate, endDate, groupBy }
  });
  return response.data;
};

// Get top selling items
export const getTopSellingItems = async (startDate, endDate, limit = 10) => {
  const response = await api.get('/api/v1/reports/top-selling-items', {
    params: { startDate, endDate, limit }
  });
  return response.data;
};

// Get category sales
export const getCategorySales = async (startDate, endDate) => {
  const response = await api.get('/api/v1/reports/category-sales', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get booking statistics
export const getBookingStats = async (startDate, endDate) => {
  const response = await api.get('/api/v1/reports/booking-stats', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get staff performance
export const getStaffPerformance = async (startDate, endDate) => {
  const response = await api.get('/api/v1/reports/staff-performance', {
    params: { startDate, endDate }
  });
  return response.data;
}; 