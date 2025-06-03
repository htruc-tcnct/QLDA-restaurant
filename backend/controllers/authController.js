const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwtUtils');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;

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
      role: 'customer', // Default role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token: generateToken(user._id),
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

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Check if login is email or username
    const isEmail = login.includes('@');
    
    // Find user by email or username
    const user = await User.findOne(
      isEmail ? { email: login } : { username: login }
    );

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401);
      throw new Error('Your account has been deactivated');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      phoneNumber: req.user.phoneNumber,
      role: req.user.role,
      isActive: req.user.isActive,
      loyaltyPoints: req.user.loyaltyPoints,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    res.status(500);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
};

// Protect routes - only authenticated users can access
const protect = catchAsync(async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401)
    );
  }

  // 2) Verify token
  const decoded = await verifyToken(token);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('Người dùng thuộc token này không còn tồn tại.', 401)
    );
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(
      new AppError('Tài khoản này đã bị vô hiệu hóa.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// Optional protection - if token exists, set req.user, otherwise continue
const protectOptional = catchAsync(async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); // Continue without setting req.user
  }

  try {
    // 2) Verify token
    const decoded = await verifyToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = currentUser;
    }
  } catch (error) {
    // Ignore token verification errors and continue
  }

  next();
});

// Restrict access to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bạn không có quyền thực hiện hành động này.', 403)
      );
    }

    next();
  };
};

module.exports = { 
  registerUser, 
  loginUser, 
  getCurrentUser,
  protect,
  protectOptional,
  restrictTo
}; 