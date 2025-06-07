const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    res.json(user);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber, role, isActive } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    
    if (userExists) {
      res.status(400);
      throw new Error(
        userExists.email === email
          ? 'Email already in use'
          : 'Username already taken'
      );
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      phoneNumber,
      role: role || 'customer',
      isActive: isActive !== undefined ? isActive : true,
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Extract fields from request body
    const { email, password, fullName, phoneNumber, role, isActive } = req.body;
    
    // Check if email already exists (if changing email)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use');
      }
    }
    
    // Update fields
    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    
    // Only update password if provided
    if (password) {
      user.password = password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot delete your own account');
    }
    
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && req.body.isActive === false) {
      res.status(400);
      throw new Error('Cannot deactivate your own account');
    }
    
    user.isActive = req.body.isActive;
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Bulk delete users
// @route   POST /api/admin/users/bulk-delete
// @access  Private/Admin
const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400);
      throw new Error('No user IDs provided');
    }
    
    // Prevent admin from deleting themselves
    if (userIds.includes(req.user._id.toString())) {
      res.status(400);
      throw new Error('Cannot delete your own account');
    }
    
    await User.deleteMany({ _id: { $in: userIds } });
    
    res.json({ message: `${userIds.length} users removed` });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Bulk update user status
// @route   POST /api/admin/users/bulk-status
// @access  Private/Admin
const bulkUpdateUserStatus = async (req, res) => {
  try {
    const { userIds, isActive } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400);
      throw new Error('No user IDs provided');
    }
    
    if (isActive === undefined) {
      res.status(400);
      throw new Error('Status not provided');
    }
    
    // Prevent admin from deactivating themselves
    if (userIds.includes(req.user._id.toString()) && isActive === false) {
      res.status(400);
      throw new Error('Cannot deactivate your own account');
    }
    
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isActive } }
    );
    
    res.json({ 
      message: `${userIds.length} users ${isActive ? 'activated' : 'deactivated'}` 
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkDeleteUsers,
  bulkUpdateUserStatus,
}; 