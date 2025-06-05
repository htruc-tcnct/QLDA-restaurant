const express = require('express');
const router = express.Router();
const {
  getAllTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  clearTable,
  checkTableAvailability,
  getAvailableTables,
  markTableAsReserved,
  getUpcomingReservations
} = require('../controllers/tableController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply authentication to all routes except getAvailableTables
router.get('/available', getAvailableTables);

router.use(protect);

// Check table availability
router.get('/check-availability', authorize('staff', 'waiter', 'admin', 'manager'), checkTableAvailability);

// Routes with specific permissions
router
  .route('/')
  .get(authorize('staff', 'waiter', 'admin', 'manager'), getAllTables)
  .post(authorize('admin', 'manager'), createTable);

router
  .route('/:id')
  .get(authorize('staff', 'waiter', 'admin', 'manager'), getTable)
  .put(authorize('admin', 'manager'), updateTable)
  .delete(authorize('admin', 'manager'), deleteTable);

router
  .route('/:id/status')
  .put(authorize('staff', 'waiter', 'admin', 'manager'), updateTableStatus);

// Reserve table route
router
  .route('/:id/reserve')
  .put(authorize('staff', 'waiter', 'admin', 'manager'), markTableAsReserved);

// Get upcoming reservations for a table
router
  .route('/:id/upcoming-reservations')
  .get(authorize('staff', 'waiter', 'admin', 'manager'), getUpcomingReservations);

// Clear table route
router
  .route('/:id/clear')
  .put(authorize('staff', 'waiter', 'admin', 'manager'), clearTable);

module.exports = router; 