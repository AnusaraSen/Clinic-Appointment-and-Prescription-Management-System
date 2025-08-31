const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/maintenanceRequests');
const Technician = require('../models/Technician');
const User = require('../models/User');

/**
 * Get all maintenance requests 📋
 * This is like looking at the work order board - shows all the requests,
 * with some handy filtering options if you need them
 */
exports.getAllRequests = async (req, res) => {
  try {
    // Let people filter by status, priority, or who's assigned to it
    const { status, priority, assignedTo } = req.query;
    
    // Build our search criteria - only include filters that were actually provided
    const searchCriteria = {};
    if (status) searchCriteria.status = status;
    if (priority) searchCriteria.priority = priority;
    if (assignedTo) searchCriteria.assignedTo = assignedTo;

    // Fetch the requests and fill in the related info (who reported it, who's working on it, etc.)
    const requests = await MaintenanceRequest.find(searchCriteria)
      .populate('reportedBy', 'name email role')  // Get some basic info about who reported it
      .populate('assignedTo', 'name specialization phone availability')  // And who's fixing it
      .populate('equipment', 'name location type status')  // What equipment needs fixing
      .sort({ createdAt: -1 });  // Newest first - makes sense, right?

    return res.json({ 
      success: true, 
      message: `Found ${requests.length} maintenance requests`, 
      data: requests,
      count: requests.length 
    });
  } catch (error) {
    console.error('Oops, had trouble fetching maintenance requests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Something went wrong while getting the maintenance requests',
      // Only show detailed error info in development (security best practice)
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single maintenance request by its ID 🔍
 * Like pulling up a specific work order to see all the details
 */
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Quick sanity check - is this actually a valid MongoDB ID?
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid maintenance request ID',
        data: null 
      });
    }

    const request = await MaintenanceRequest.findById(id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name specialization phone availability')
      .populate('equipment', 'name location type status');

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found',
        data: null 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Maintenance request fetched successfully', 
      data: request 
    });
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/maintenance-requests
 * Create a new maintenance request.
 * Required fields: title, description, reportedBy
 */
exports.createRequest = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority = 'Medium', 
      reportedBy, 
      date, 
      time,
      equipment,
      cost = 0
    } = req.body;

    // Validation
    if (!title || !description || !reportedBy) {
      return res.status(400).json({ 
        success: false, 
        message: 'title, description, and reportedBy are required',
        data: null 
      });
    }

    if (!mongoose.isValidObjectId(reportedBy)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reportedBy user ID',
        data: null 
      });
    }

    // Verify reportedBy user exists
    const reporter = await User.findById(reportedBy);
    if (!reporter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reported by user not found',
        data: null 
      });
    }

    // Validate equipment IDs if provided
    if (equipment && equipment.length > 0) {
      const validEquipment = equipment.every(id => mongoose.isValidObjectId(id));
      if (!validEquipment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid equipment ID(s)',
          data: null 
        });
      }
    }

    const newRequest = await MaintenanceRequest.create({
      title,
      description,
      priority,
      reportedBy,
      date,
      time,
      equipment: equipment || [],
      cost
    });

    // Populate the created request
    await newRequest.populate([
      { path: 'reportedBy', select: 'name email role' },
      { path: 'equipment', select: 'name location type status' }
    ]);

    return res.status(201).json({ 
      success: true, 
      message: 'Maintenance request created successfully', 
      data: newRequest 
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors,
        data: null 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/maintenance-requests/:id/assign
 * Assign a maintenance request to a technician.
 */
exports.assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid maintenance request ID',
        data: null 
      });
    }

    if (!technicianId) {
      return res.status(400).json({ 
        success: false, 
        message: 'technicianId is required',
        data: null 
      });
    }

    if (!mongoose.isValidObjectId(technicianId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid technician ID',
        data: null 
      });
    }

    // Verify technician exists and can accept new requests
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ 
        success: false, 
        message: 'Technician not found',
        data: null 
      });
    }

    // Check if technician can accept new requests (async method for accuracy)
    const canAccept = await technician.canAcceptNewRequestAsync();
    if (!canAccept) {
      return res.status(400).json({ 
        success: false, 
        message: 'Technician is not available or at capacity',
        data: null 
      });
    }

    // Update the maintenance request
    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id, 
      { 
        assignedTo: technicianId,
        status: 'In Progress' // Auto-update status when assigned
      }, 
      { new: true }
    )
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name specialization phone availability')
    .populate('equipment', 'name location type status');

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found',
        data: null 
      });
    }

    // Update technician's assigned requests array
    if (!technician.assignedRequests.includes(id)) {
      technician.assignedRequests.push(id);
      await technician.save();
    }

    return res.json({ 
      success: true, 
      message: 'Maintenance request assigned successfully', 
      data: updated 
    });
  } catch (error) {
    console.error('Error assigning maintenance request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to assign maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/maintenance-requests/:id
 * Update a maintenance request's mutable fields.
 */
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid maintenance request ID',
        data: null 
      });
    }

    const allowedFields = [
      'title', 
      'description', 
      'status', 
      'priority', 
      'cost', 
      'date', 
      'time',
      'equipment'
    ];
    
    const update = {};

    // Only include allowed fields that are present in the request body
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    // Validate equipment IDs if being updated
    if (update.equipment && update.equipment.length > 0) {
      const validEquipment = update.equipment.every(id => mongoose.isValidObjectId(id));
      if (!validEquipment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid equipment ID(s)',
          data: null 
        });
      }
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(id, update, { 
      new: true,
      runValidators: true // Run schema validators on update
    })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name specialization phone availability')
    .populate('equipment', 'name location type status');

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found',
        data: null 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Maintenance request updated successfully', 
      data: updated 
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors,
        data: null 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/maintenance-requests/:id/complete
 * Mark a maintenance request as completed.
 */
exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { cost, notes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid maintenance request ID',
        data: null 
      });
    }

    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found',
        data: null 
      });
    }

    // Update request status and optional fields
    const update = { status: 'Completed' };
    if (cost !== undefined) update.cost = cost;
    if (notes !== undefined) update.notes = notes;

    const updated = await MaintenanceRequest.findByIdAndUpdate(id, update, { new: true })
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name specialization phone availability')
      .populate('equipment', 'name location type status');

    // Remove from technician's assigned requests if assigned
    if (updated.assignedTo) {
      const technician = await Technician.findById(updated.assignedTo);
      if (technician) {
        await technician.completeRequest(id);
      }
    }

    return res.json({ 
      success: true, 
      message: 'Maintenance request completed successfully', 
      data: updated 
    });
  } catch (error) {
    console.error('Error completing maintenance request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to complete maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/maintenance-requests/:id
 * Permanently remove a maintenance request.
 */
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid maintenance request ID',
        data: null 
      });
    }

    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found',
        data: null 
      });
    }

    // Remove from technician's assigned requests if assigned
    if (request.assignedTo) {
      const technician = await Technician.findById(request.assignedTo);
      if (technician) {
        await technician.completeRequest(id);
      }
    }

    await MaintenanceRequest.findByIdAndDelete(id);

    return res.json({ 
      success: true, 
      message: 'Maintenance request deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/maintenance-requests/stats
 * Get maintenance request statistics.
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await MaintenanceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' },
          avgCost: { $avg: '$cost' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await MaintenanceRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      message: 'Statistics fetched successfully',
      data: {
        byStatus: stats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance request stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};