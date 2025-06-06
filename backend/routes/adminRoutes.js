const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkDeleteUsers,
  bulkUpdateUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin', 'manager'));

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.patch('/users/:id/status', updateUserStatus);

// Bulk operations
router.post('/users/bulk-delete', bulkDeleteUsers);
router.post('/users/bulk-status', bulkUpdateUserStatus);

module.exports = router; 