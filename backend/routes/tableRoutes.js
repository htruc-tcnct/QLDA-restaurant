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
router.get('/check-availability', authorize('waiter', 'manager'), checkTableAvailability);

// Routes with specific permissions
router
  .route('/')
  .get(authorize('waiter', 'manager', 'chef'), getAllTables)
  .post(authorize('manager'), createTable);

router
  .route('/:id')
  .get(authorize('waiter', 'manager', 'chef'), getTable)
  .put(authorize('manager'), updateTable)
  .delete(authorize('manager'), deleteTable);

router
  .route('/:id/status')
  .put(authorize('waiter', 'manager'), updateTableStatus);

// Reserve table route
router
  .route('/:id/reserve')
  .put(authorize('waiter', 'manager'), markTableAsReserved);

// Get upcoming reservations for a table
router
  .route('/:id/upcoming-reservations')
  .get(authorize('waiter', 'manager'), getUpcomingReservations);

// Clear table route
router
  .route('/:id/clear')
  .put(authorize('waiter', 'manager'), clearTable);

module.exports = router; 