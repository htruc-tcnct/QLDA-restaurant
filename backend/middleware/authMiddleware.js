const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Protect routes - check if user is authenticated
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(
      new AppError('This user account has been deactivated.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'manager', etc]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Check if user is manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
  if (!['manager', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Check if user is staff, manager or admin
exports.isStaffOrAbove = (req, res, next) => {
  if (!['staff', 'waiter', 'chef', 'manager', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Check if user is waiter, manager or admin
exports.isWaiterOrAbove = (req, res, next) => {
  if (!['waiter', 'staff', 'manager', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Check if user can manage orders (waiters, chefs, managers, admins)
exports.canManageOrders = (req, res, next) => {
  if (!['waiter', 'staff', 'chef', 'manager', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to view or manage orders', 403)
    );
  }
  next();
};

// Check if user can manage bookings (waiters, staff, managers, admins)
exports.canManageBookings = (req, res, next) => {
  if (!['waiter', 'staff', 'manager', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to view or manage bookings', 403)
    );
  }
  next();
};

// Check if user is chef, manager or admin
exports.isChefOrAbove = (req, res, next) => {
  if (!['chef', 'manager', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Check if user is the owner of the resource or has higher privileges
exports.isOwnerOrAdmin = (model) => {
  return catchAsync(async (req, res, next) => {
    // Get the resource
    const resource = await model.findById(req.params.id);
    
    if (!resource) {
      return next(new AppError('No resource found with that ID', 404));
    }
    
    // Check if user is the owner or admin/manager
    const isOwner = resource.user && resource.user.toString() === req.user.id;
    const hasPrivilege = ['admin', 'manager'].includes(req.user.role);
    
    if (!isOwner && !hasPrivilege) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    
    next();
  });
}; 