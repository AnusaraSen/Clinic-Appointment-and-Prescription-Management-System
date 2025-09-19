const jwt = require('jsonwebtoken');
const Pharmacist = require('../models/Pharmacist');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get pharmacist from token
      req.user = await Pharmacist.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, pharmacist not found'
        });
      }

      // Check if pharmacist is active
      if (req.user.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'Account is not active. Please contact administrator.'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Check permissions
const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' is required to access this route`
      });
    }

    next();
  };
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if pharmacist can dispense medication
const authorizeDispensing = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no user found'
    });
  }

  if (!req.user.hasPermission('canDispenseMedicine')) {
    return res.status(403).json({
      success: false,
      message: 'Permission to dispense medicine is required'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  authorizePermission,
  authorizeDispensing
};