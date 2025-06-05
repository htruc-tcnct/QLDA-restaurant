const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Protect all routes and restrict to admin or manager role
router.use(protect, authorize('admin', 'manager'));

// Sales summary
router.get('/sales-summary', reportController.getSalesSummary);

// Sales over time
router.get('/sales-over-time', reportController.getSalesOverTime);

// Top selling items
router.get('/top-selling-items', reportController.getTopSellingItems);

// Category sales
router.get('/category-sales', reportController.getCategorySales);

// Booking stats
router.get('/booking-stats', reportController.getBookingStats);

// Staff performance
router.get('/staff-performance', reportController.getStaffPerformance);

module.exports = router; 