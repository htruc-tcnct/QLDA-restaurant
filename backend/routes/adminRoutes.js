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

// Protect all admin routes
router.use(protect);

// Authorize only admin and manager
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