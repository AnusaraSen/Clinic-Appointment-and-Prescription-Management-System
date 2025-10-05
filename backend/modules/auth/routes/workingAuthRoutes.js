/**
 * Working Auth Routes - Simplified without problematic middleware
 */
const express = require('express');
const WorkingAuthController = require('../controllers/WorkingAuthController');

const router = express.Router();

// Simple validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      error: 'MISSING_EMAIL'
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
      error: 'MISSING_PASSWORD'
    });
  }
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
      error: 'INVALID_EMAIL'
    });
  }
  
  next();
};

// Login route
router.post('/login', 
  (req, res, next) => {
    console.log('🚪 Login route hit:', req.method, req.url);
    console.log('📦 Request body:', req.body);
    next();
  },
  validateLogin,
  WorkingAuthController.login
);

// Logout route
router.post('/logout', WorkingAuthController.logout);

// Refresh token route
router.post('/refresh', 
  (req, res, next) => {
    console.log('🔄 Refresh route hit:', req.method, req.url);
    console.log('📦 Request body:', req.body);
    next();
  },
  WorkingAuthController.refreshToken
);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Working auth routes operational!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;