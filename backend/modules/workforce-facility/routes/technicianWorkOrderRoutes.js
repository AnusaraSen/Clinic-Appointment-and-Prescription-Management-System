const express = require('express');
const router = express.Router();
const technicianWorkOrderController = require('../controllers/TechnicianWorkOrderController');
const { protect } = require('../../../middleware/authMiddleware');

/**
 * Technician Work Order Routes
 * All routes require authentication
 */

// Get my assigned work orders
router.get('/my-work-orders', protect, technicianWorkOrderController.getMyWorkOrders);

// Start a work order
router.patch('/work-orders/:id/start', protect, technicianWorkOrderController.startWorkOrder);

// Complete a work order
router.patch('/work-orders/:id/complete', protect, technicianWorkOrderController.completeWorkOrder);

// Get dashboard stats
router.get('/dashboard-stats', protect, technicianWorkOrderController.getDashboardStats);

module.exports = router;
