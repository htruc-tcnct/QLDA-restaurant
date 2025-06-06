const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

// Lấy thông tin profile của người dùng đang đăng nhập
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Cập nhật thông tin profile của người dùng đang đăng nhập
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const { fullName, email, phoneNumber, preferences } = req.body;

  // Không cho phép cập nhật mật khẩu qua route này
  if (req.body.password) {
    return next(new AppError('Route này không dùng để cập nhật mật khẩu. Vui lòng sử dụng /update-password', 400));
  }

  // Không cho phép cập nhật role
  if (req.body.role) {
    return next(new AppError('Bạn không thể thay đổi vai trò của mình', 400));
  }

  // Tạo đối tượng chứa các trường cần cập nhật
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (email) updateFields.email = email;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (preferences) updateFields.preferences = preferences;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Cập nhật mật khẩu của người dùng đang đăng nhập
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Vui lòng cung cấp mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới', 400));
  }

  // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp nhau không
  if (newPassword !== confirmPassword) {
    return next(new AppError('Mật khẩu mới và xác nhận mật khẩu không khớp', 400));
  }

  // Lấy user từ database
  const user = await User.findById(req.user._id);

  // Kiểm tra mật khẩu hiện tại có đúng không
  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Mật khẩu hiện tại không đúng', 401));
  }

  // Cập nhật mật khẩu
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Cập nhật mật khẩu thành công'
  });
});

// Lấy thông tin profile của một người dùng bất kỳ (chỉ dành cho admin)
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Cập nhật thông tin của một người dùng bất kỳ (chỉ dành cho admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  const { fullName, email, phoneNumber, role, isActive, preferences, loyaltyPoints } = req.body;

  // Không cho phép cập nhật mật khẩu qua route này
  if (req.body.password) {
    return next(new AppError('Route này không dùng để cập nhật mật khẩu', 400));
  }

  // Tạo đối tượng chứa các trường cần cập nhật
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (email) updateFields.email = email;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (role) updateFields.role = role;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (preferences) updateFields.preferences = preferences;
  if (loyaltyPoints !== undefined) updateFields.loyaltyPoints = loyaltyPoints;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!updatedUser) {
    return next(new AppError('Không tìm thấy người dùng với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
}); 