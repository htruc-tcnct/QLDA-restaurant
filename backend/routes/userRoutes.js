const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes cho người dùng đã đăng nhập
router.use(authController.protect);

// Quản lý profile của người dùng đang đăng nhập
router.get('/me', userController.getMyProfile);
router.patch('/update-me', userController.updateMyProfile);
router.patch('/update-password', userController.updateMyPassword);

// Routes chỉ dành cho admin
router.use(authController.restrictTo('admin', 'manager'));

// Quản lý tất cả người dùng (chỉ admin)
router.get('/:id', userController.getUserProfile);
router.patch('/:id', userController.updateUser);

module.exports = router; 