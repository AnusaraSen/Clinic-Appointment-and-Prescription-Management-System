const express = require("express");
const router = express.Router();
const {
  getDashboardData,
  getTaskStatistics
} = require("../Controllers/dashboardController");

// GET /api/dashboard - Get dashboard data (statistics, recent assignments, staff availability)
router.get("/", getDashboardData);

// GET /api/dashboard/tasks - Get task statistics
router.get("/tasks", getTaskStatistics);

module.exports = router;