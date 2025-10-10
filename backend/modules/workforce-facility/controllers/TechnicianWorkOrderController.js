const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/MaintenanceRequests');
const Technician = require('../models/Technician');

/**
 * Technician Work Order Controller
 * Handles technician-specific operations for their assigned work orders
 */

/**
 * GET /api/technicians/my-work-orders
 * Fetch work orders assigned to the logged-in technician
 * Query params: status, priority, sortBy, sortOrder, page, limit
 */
exports.getMyWorkOrders = async (req, res) => {
  try {
    const technicianUserId = req.user.id; // From auth middleware
    
    // Find the technician record linked to this user
    const technician = await Technician.findOne({ user: technicianUserId });
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found',
        data: null
      });
    }

    // Build query
    const query = { assignedTo: technician._id };

    // Apply filters from query params
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const [workOrders, total] = await Promise.all([
      MaintenanceRequest.find(query)
        .populate('reportedBy', 'name email role')
        .populate('equipment', 'equipment_id name location type status')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      MaintenanceRequest.countDocuments(query)
    ]);

    return res.json({
      success: true,
      message: 'Work orders retrieved successfully',
      data: {
        workOrders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching my work orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch work orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /api/technicians/work-orders/:id/start
 * Mark a work order as started (In Progress)
 */
exports.startWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianUserId = req.user.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid work order ID',
        data: null
      });
    }

    // Find the technician
    const technician = await Technician.findOne({ user: technicianUserId });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found',
        data: null
      });
    }

    // Find the work order
    const workOrder = await MaintenanceRequest.findById(id);
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found',
        data: null
      });
    }

    // Verify it's assigned to this technician
    if (!workOrder.assignedTo || workOrder.assignedTo.toString() !== technician._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This work order is not assigned to you',
        data: null
      });
    }

    // Check current status
    if (workOrder.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a completed work order',
        data: null
      });
    }

    if (workOrder.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a cancelled work order',
        data: null
      });
    }

    // Update status and set startedAt if not already set
    const update = {
      status: 'In Progress'
    };

    if (!workOrder.startedAt) {
      update.startedAt = new Date();
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id,
      update,
      { new: true }
    )
      .populate('reportedBy', 'name email role')
      .populate('equipment', 'equipment_id name location type status');

    return res.json({
      success: true,
      message: 'Work order started successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error starting work order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start work order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /api/technicians/work-orders/:id/complete
 * Mark a work order as completed
 */
exports.completeWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianUserId = req.user.id;
    const { notes, actualCost } = req.body; // Optional completion data

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid work order ID',
        data: null
      });
    }

    // Find the technician
    const technician = await Technician.findOne({ user: technicianUserId });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found',
        data: null
      });
    }

    // Find the work order
    const workOrder = await MaintenanceRequest.findById(id);
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found',
        data: null
      });
    }

    // Verify it's assigned to this technician
    if (!workOrder.assignedTo || workOrder.assignedTo.toString() !== technician._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This work order is not assigned to you',
        data: null
      });
    }

    // Check current status
    if (workOrder.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Work order is already completed',
        data: null
      });
    }

    if (workOrder.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled work order',
        data: null
      });
    }

    // Prepare update
    const update = {
      status: 'Completed',
      completedAt: new Date()
    };

    // Set startedAt if somehow it wasn't set (fallback)
    if (!workOrder.startedAt) {
      update.startedAt = workOrder.updatedAt || new Date();
    }

    // Add optional fields
    if (notes) {
      update.notes = workOrder.notes ? `${workOrder.notes}\n\nCompletion notes: ${notes}` : notes;
    }

    if (actualCost !== undefined && actualCost !== null) {
      update.cost = actualCost;
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id,
      update,
      { new: true }
    )
      .populate('reportedBy', 'name email role')
      .populate('equipment', 'equipment_id name location type status');

    return res.json({
      success: true,
      message: 'Work order completed successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error completing work order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete work order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/technicians/dashboard-stats
 * Get quick stats for technician dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const technicianUserId = req.user.id;

    // Find the technician
    const technician = await Technician.findOne({ user: technicianUserId });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found',
        data: null
      });
    }

    // Get today's date range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Build queries
    const baseQuery = { assignedTo: technician._id };

    // Aggregate stats
    const [
      totalAssigned,
      openCount,
      inProgressCount,
      completedToday,
      completedTotal,
      avgCompletionTime
    ] = await Promise.all([
      MaintenanceRequest.countDocuments(baseQuery),
      MaintenanceRequest.countDocuments({ ...baseQuery, status: 'Open' }),
      MaintenanceRequest.countDocuments({ ...baseQuery, status: 'In Progress' }),
      MaintenanceRequest.countDocuments({
        ...baseQuery,
        status: 'Completed',
        completedAt: { $gte: startOfToday, $lte: endOfToday }
      }),
      MaintenanceRequest.countDocuments({ ...baseQuery, status: 'Completed' }),
      MaintenanceRequest.aggregate([
        {
          $match: {
            assignedTo: technician._id,
            status: 'Completed',
            startedAt: { $ne: null },
            completedAt: { $ne: null }
          }
        },
        {
          $project: {
            duration: {
              $divide: [
                { $subtract: ['$completedAt', '$startedAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: '$duration' }
          }
        }
      ])
    ]);

    const stats = {
      totalAssigned,
      open: openCount,
      inProgress: inProgressCount,
      completedToday,
      completedTotal,
      avgCompletionTimeHours: avgCompletionTime.length > 0 ? avgCompletionTime[0].avgHours : 0
    };

    return res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
