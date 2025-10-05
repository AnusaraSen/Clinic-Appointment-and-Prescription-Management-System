/**
 * Dashboard Statistics Routes - Express routes for dashboard analytics! 📊
 * 
 * These routes handle all dashboard statistics requests including:
 * - GET /api/dashboard/statistics - Get comprehensive dashboard data
 * - POST /api/dashboard/statistics/refresh - Force refresh the cache
 * 
 * Perfect for the frontend to get all dashboard data in one API call!
 */

const express = require('express');
const router = express.Router();

// Import the dashboard statistics controller
const { 
  getDashboardStatistics, 
  clearCache,
  getCacheStats
} = require('../controllers/DashboardStatisticsController');

// Optional: Import authentication middleware if you want to protect these routes
// const { authenticateToken } = require('../../../middleware/auth');

/**
 * @route   GET /api/dashboard/statistics
 * @desc    Get comprehensive dashboard statistics
 * @access  Public (or Protected if you add auth middleware)
 * @returns {Object} Complete dashboard statistics including KPIs, user metrics, equipment stats
 */
router.get('/statistics', getDashboardStatistics);

/**
 * @route   POST /api/dashboard/statistics/refresh
 * @desc    Clear statistics cache and force refresh
 * @access  Public (or Protected if you add auth middleware)
 * @returns {Object} Success message
 */
router.post('/statistics/refresh', clearCache);

/**
 * @route   GET /api/dashboard/cache-stats
 * @desc    Get cache performance statistics
 * @access  Public (or Protected if you add auth middleware)
 * @returns {Object} Cache and memory statistics
 */
router.get('/cache-stats', getCacheStats);

/**
 * @route   GET /api/dashboard/health
 * @desc    Simple health check for the dashboard API
 * @access  Public
 * @returns {Object} Health status
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard API is running smoothly! 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;