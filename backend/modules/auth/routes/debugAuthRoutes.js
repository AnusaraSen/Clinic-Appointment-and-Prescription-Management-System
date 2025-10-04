/**
 * Debug auth routes to isolate the issue
 */
const express = require('express');
const DebugAuthController = require('../controllers/DebugAuthController');

const router = express.Router();

// Simple login route without complex middleware
router.post('/login', (req, res, next) => {
  console.log('🚪 Debug login route hit!');
  console.log('📦 Request body:', req.body);
  next();
}, DebugAuthController.login);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'Debug auth routes working!' });
});

module.exports = router;