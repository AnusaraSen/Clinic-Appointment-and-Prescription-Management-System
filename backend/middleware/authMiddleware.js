const { verifyAccessToken, extractTokenFromHeader } = require('../utils/tokenUtils');
const User = require('../modules/workforce-facility/models/User');

/**
 * Authentication Middleware - Guardian of the System! 🛡️
 * 
 * Protects routes and provides user context to protected endpoints
 */

/**
 * Verify JWT token and authenticate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    console.log('🔐 verifyToken middleware called for:', req.method, req.path);
    
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req);

    if (!token) {
      console.log('❌ No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'NO_TOKEN'
      });
    }

    console.log('🔑 Token received, verifying...');
    // Verify the token
    const decoded = verifyAccessToken(token);
    console.log('✅ Token decoded successfully, userId:', decoded.userId);

    // Get fresh user data from database
    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken') // Exclude sensitive fields
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user to request object for use in route handlers
    req.user = user;
    req.token = token;

    console.log('✅ User authenticated:', user.email, '| Role:', user.role);
    next();

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);

    // Handle specific token errors
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('Invalid') || error.message.includes('verification failed')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        error: 'INVALID_TOKEN'
      });
    }

    // Generic authentication error
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_FAILED'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    // Try to verify token
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken')
      .lean();

    if (user && user.isActive !== false) {
      req.user = user;
      req.token = token;
      console.log('✅ Optional auth - User authenticated:', user.email);
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // If token verification fails, continue without authentication
    console.log('ℹ️ Optional auth - Token verification failed, continuing unauthenticated');
    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 * @returns {Function} - Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      console.log('❌ Access denied for user:', req.user.email, '| Required roles:', allowedRoles, '| User role:', req.user.role);
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    console.log('✅ Role authorization passed for user:', req.user.email, '| Role:', req.user.role);
    next();
  };
};

/**
 * Admin-only authorization middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireAdmin = requireRole(['Admin']);

/**
 * Staff authorization middleware (Admin, Doctor, Technician, etc.)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireStaff = requireRole(['Admin', 'Doctor', 'Technician', 'LabStaff', 'Pharmacist', 'InventoryManager', 'LabSupervisor']);

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireStaff
};
