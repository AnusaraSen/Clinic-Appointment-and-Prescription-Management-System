const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyToken, requireAdmin } = require('../../../middleware/authMiddleware');
const validation = require('../../../middleware/validation');
const AuthController = require('../controllers/AuthController');

/**
 * Authentication Routes - Gateway to the System! 🚪
 * 
 * Handles all authentication-related endpoints
 * Includes rate limiting for security
 */

const router = express.Router();

// Rate limiting for auth endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 attempts per 15 minutes per IP (increased for development)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost addresses (development)
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
  }
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 registration attempts per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
    error: 'REGISTRATION_RATE_LIMIT'
  }
});

/**
 * POST /api/auth/login - User login
 * Rate limited, requires email and password
 */
router.post('/login', 
  (req, res, next) => {
    console.log('🚪 Login route hit!', req.method, req.url);
    console.log('📦 Request body:', req.body);
    next();
  },
  authLimiter,
  validation.validateWithJoi(validation.authSchemas.login),
  AuthController.login
);

/**
 * POST /api/auth/logout - User logout
 * Requires authentication
 */
router.post('/logout', 
  verifyToken,
  AuthController.logout
);

/**
 * POST /api/auth/refresh - Refresh access token
 * Rate limited, requires refresh token
 */
router.post('/refresh',
  authLimiter,
  validation.validateWithJoi(validation.authSchemas.refreshToken),
  AuthController.refreshToken
);

/**
 * POST /api/auth/register-staff - Register staff member (Admin only)
 * Requires admin authentication and rate limiting
 */
router.post('/register-staff',
  registrationLimiter,
  verifyToken,
  requireAdmin,
  validation.validateWithJoi(validation.authSchemas.registerStaff),
  AuthController.registerStaff
);

/**
 * POST /api/auth/register-patient - Patient self-registration
 * Rate limited, public endpoint
 */
router.post('/register-patient',
  registrationLimiter,
  validation.validateWithJoi(validation.authSchemas.registerPatient),
  AuthController.registerPatient
);

/**
 * GET /api/auth/me - Get current user profile
 * Requires authentication
 */
router.get('/me',
  verifyToken,
  AuthController.getCurrentUser
);

/**
 * Health check endpoint for auth service
 * GET /api/auth/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString(),
    service: 'auth'
  });
});

/**
 * Simple test endpoint to verify routing works
 * GET /api/auth/test
 */
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called!');
  res.status(200).json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * Simple test POST endpoint 
 * POST /api/auth/test-post
 */
router.post('/test-post', (req, res) => {
  console.log('🧪 Test POST endpoint called!', req.body);
  res.status(200).json({
    success: true,
    message: 'POST routes are working!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

/**
 * Simple login test without middleware
 * POST /api/auth/simple-login
 */
router.post('/simple-login', (req, res) => {
  console.log('🔐 Simple login called!', req.body);
  res.status(200).json({
    success: true,
    message: 'Simple login route works!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
