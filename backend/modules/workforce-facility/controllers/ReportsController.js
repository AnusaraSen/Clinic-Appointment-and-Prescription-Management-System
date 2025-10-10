const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/MaintenanceRequests');
const Technician = require('../models/Technician');

/**
 * Reports Controller
 * Handles analytics and reporting endpoints for maintenance management
 */

/**
 * Get report metrics (KPIs)
 * Returns key performance indicators for the dashboard
 */
exports.getReportMetrics = async (req, res) => {
  try {
    const { startDate, endDate, status, priority } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Build search criteria
    const searchCriteria = { ...dateFilter };
    if (status) searchCriteria.status = status;
    if (priority) searchCriteria.priority = priority;

    // 1. Total Requests
    const totalRequests = await MaintenanceRequest.countDocuments(searchCriteria);

    // 2. Completion Rate
    const completedRequests = await MaintenanceRequest.countDocuments({
      ...searchCriteria,
      status: 'Completed'
    });
    const completionRate = totalRequests > 0 
      ? Math.round((completedRequests / totalRequests) * 100) 
      : 0;

    // 3. Average Completion Time (in hours)
    const completedWithTime = await MaintenanceRequest.aggregate([
      {
        $match: {
          ...searchCriteria,
          status: 'Completed',
          updatedAt: { $exists: true }
        }
      },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert milliseconds to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$completionTime' }
        }
      }
    ]);

    const avgCompletionTime = completedWithTime.length > 0 
      ? Math.round(completedWithTime[0].avgTime) 
      : 0;

    // 4. Active Technicians (available or busy)
    const activeTechnicians = await Technician.countDocuments({
      availabilityStatus: { $in: ['available', 'busy'] }
    });

    // 5. Total Cost
    const costAggregation = await MaintenanceRequest.aggregate([
      { $match: searchCriteria },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    const totalCost = costAggregation.length > 0 
      ? costAggregation[0].totalCost 
      : 0;

    // Calculate trends (compare with previous period)
    // For simplicity, we'll skip trend calculations for now
    // You can add them later by comparing current period with previous period

    const metrics = {
      totalRequests,
      completionRate,
      avgCompletionTime,
      activeTechnicians,
      totalCost,
      requestsTrend: null,
      completionTrend: null,
      timeTrend: null,
      techniciansTrend: null,
      costTrend: null
    };

    return res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching report metrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get status distribution data
 * Returns count and percentage for each status
 */
exports.getStatusDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate by status
    const distribution = await MaintenanceRequest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total for percentages
    const total = distribution.reduce((sum, item) => sum + item.count, 0);

    // Format data with percentages
    const formattedData = distribution.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    // Ensure all statuses are present (even if count is 0)
    const allStatuses = ['Open', 'In Progress', 'Completed', 'Cancelled'];
    const completeData = allStatuses.map(status => {
      const found = formattedData.find(item => item.status === status);
      return found || { status, count: 0, percentage: 0 };
    });

    return res.json({
      success: true,
      data: completeData
    });

  } catch (error) {
    console.error('Error fetching status distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch status distribution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get technician workload data
 * Returns request count for each technician
 */
exports.getTechnicianWorkload = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all technicians with their assigned requests
    const technicians = await Technician.find()
      .populate({
        path: 'assignedRequests',
        match: startDate || endDate ? {
          createdAt: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        } : {}
      })
      .lean();

    // Format workload data
    const workloadData = technicians.map(tech => ({
      technician_id: tech.technician_id,
      name: `${tech.firstName} ${tech.lastName}`,
      requestCount: tech.assignedRequests ? tech.assignedRequests.length : 0,
      availability: tech.availabilityStatus || 'available'
    }));

    // Sort by request count descending
    workloadData.sort((a, b) => b.requestCount - a.requestCount);

    return res.json({
      success: true,
      data: workloadData
    });

  } catch (error) {
    console.error('Error fetching technician workload:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch technician workload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get requests trend data
 * Returns monthly created vs completed requests
 */
exports.getRequestsTrend = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate by month
    const trend = await MaintenanceRequest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formattedTrend = trend.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      created: item.created,
      completed: item.completed
    }));

    return res.json({
      success: true,
      data: formattedTrend
    });

  } catch (error) {
    console.error('Error fetching requests trend:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch requests trend',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;
