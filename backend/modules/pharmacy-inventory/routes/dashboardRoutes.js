const express = require('express');
const router = express.Router();
const { getPharmacyDashboardSummary } = require('../controllers/dashboardController');

// Pharmacy Inventory Dashboard Summary
// GET /api/pharmacy-dashboard/summary
router.get('/summary', getPharmacyDashboardSummary);

module.exports = router;
