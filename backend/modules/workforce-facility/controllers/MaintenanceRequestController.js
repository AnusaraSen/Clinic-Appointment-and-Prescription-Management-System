const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/MaintenanceRequests');
const Technician = require('../models/Technician');
const User = require('../models/User');
const { 
  handleMaintenanceRequestCreated, 
  handleMaintenanceRequestCompleted 
} = require('./EquipmentController');
const notificationService = require('../../../services/notificationService');

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
  .populate('equipment', 'name location type status modelNumber model_number model')  // What equipment needs fixing
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
      .populate('equipment', 'name location type status modelNumber model_number model');

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
  console.log('🔧 CREATE REQUEST - Received data:', JSON.stringify(req.body, null, 2));
  
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

    console.log('🔧 CREATE REQUEST - Extracted fields:', {
      title, description, priority, reportedBy, date, time, equipment, cost
    });

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

    console.log('🔧 CREATE REQUEST - Creating new document...');
    
    const newRequest = new MaintenanceRequest({
      title,
      description,
      priority,
      reportedBy,
      date,
      time,
      equipment: equipment || [],
      cost
    });

    console.log('🔧 CREATE REQUEST - Before save, request_id:', newRequest.request_id);
    
    await newRequest.save();
    
    console.log('🔧 CREATE REQUEST - After save, request_id:', newRequest.request_id);

    // 🔄 AUTO-UPDATE EQUIPMENT STATUS
    if (equipment && equipment.length > 0) {
      await handleMaintenanceRequestCreated(equipment, priority);
      console.log(`🔄 Auto-updated status for ${equipment.length} equipment items`);
    }

    // Populate the created request
    await newRequest.populate([
      { path: 'reportedBy', select: 'name email role' },
      { path: 'equipment', select: 'name location type status' }
    ]);

    // 🔔 Create notification for new maintenance request
    if (priority === 'Critical' || priority === 'High') {
      await notificationService.notifyUrgentMaintenanceRequest(newRequest);
    } else {
      await notificationService.notifyNewMaintenanceRequest(newRequest);
    }

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
  console.log('🔧 ASSIGN REQUEST - Starting assignment process');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    console.log('🔍 Validating request ID:', id);
    if (!mongoose.isValidObjectId(id)) {
      console.log('❌ Invalid request ID');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid maintenance request ID',
        data: null 
      });
    }

    console.log('🔍 Checking technician ID:', technicianId);
    if (!technicianId) {
      console.log('❌ Missing technician ID');
      return res.status(400).json({ 
        success: false, 
        message: 'technicianId is required',
        data: null 
      });
    }

    if (!mongoose.isValidObjectId(technicianId)) {
      console.log('❌ Invalid technician ID');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid technician ID',
        data: null 
      });
    }

    console.log('🔍 Looking for technician:', technicianId);
    // Verify technician exists and can accept new requests
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      console.log('❌ Technician not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Technician not found',
        data: null 
      });
    }

    console.log('✅ Found technician:', technician.name);
    console.log('🔍 Checking technician availability...');
    console.log('Technician data:', {
      name: technician.name,
      availability: technician.availability,
      assignedRequests: technician.assignedRequests,
      maxConcurrentRequests: 5, // Default limit
      isCurrentlyEmployed: technician.isCurrentlyEmployed
    });

    // Check if technician can accept new requests
    const canAccept = technician.canAcceptNewRequest();
    console.log('🔍 Can technician accept new request?', canAccept);
    
    if (!canAccept) {
      console.log('❌ Technician cannot accept new requests');
      return res.status(400).json({ 
        success: false, 
        message: 'Technician is not available or at capacity',
        data: null 
      });
    }

    console.log('🔍 Updating maintenance request...');
    // Update the maintenance request
    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id, 
      { 
        assignedTo: technicianId,
        status: 'In Progress', // Auto-update status when assigned
        startedAt: new Date() // Track when work actually started
      }, 
      { new: true }
    )
  .populate('reportedBy', 'name email role')
  .populate('assignedTo', 'name specialization phone availability')
  .populate('equipment', 'name location type status modelNumber model_number model');

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
    console.error('🚨 ERROR in assignRequest:', error);
    console.error('🚨 Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking technician availability',
      data: null
    });
  }
};

/**
 * PUT /api/maintenance-requests/:id
 * Update a maintenance request's mutable fields.
 */
exports.updateRequest = async (req, res) => {
  try {
    console.log('🚀 updateRequest called with body:', JSON.stringify(req.body, null, 2));
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
      'equipment',
      'category',
      'estimatedHours',
      'notes',
      'assignedTo',
      'costs'
    ];
    
    const update = {};

    // Only include allowed fields that are present in the request body
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    // If costs array is provided, calculate total cost automatically
    if (update.costs && Array.isArray(update.costs)) {
      console.log('💰 Processing costs array:', update.costs);
      const totalCost = update.costs.reduce((sum, item) => {
        return sum + (parseFloat(item.cost) || 0);
      }, 0);
      update.cost = totalCost; // Update the total cost field
      console.log('💰 Calculated total cost:', totalCost);
    } else {
      console.log('⚠️ No costs array found in update:', { hasCosts: !!update.costs, isArray: Array.isArray(update.costs) });
    }

    // Set startedAt when status changes to 'In Progress'
    if (update.status === 'In Progress') {
      const existing = await MaintenanceRequest.findById(id);
      if (existing && !existing.startedAt) {
        update.startedAt = new Date();
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

    // Validate assignedTo if provided
    if (update.assignedTo !== undefined && update.assignedTo !== null && update.assignedTo !== '') {
      if (!mongoose.isValidObjectId(update.assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignedTo technician ID',
          data: null
        });
      }
      // Optionally, could verify technician exists here
    }

    console.log('🔍 About to update database with:', JSON.stringify(update, null, 2));

    // Get the existing request before update for comparison
    const existingRequest = await MaintenanceRequest.findById(id)
      .populate('assignedTo', 'name');

    const updated = await MaintenanceRequest.findByIdAndUpdate(id, update, { 
      new: true,
      runValidators: true // Run schema validators on update
    })
  .populate('reportedBy', 'name email role')
  .populate('assignedTo', 'name specialization phone availability')
  .populate('equipment', 'name location type status modelNumber model_number model');

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Maintenance request not found',
        data: null 
      });
    }

    console.log('✅ Database updated successfully. Cost field:', updated.cost, 'Costs array:', updated.costs);

    // 🔔 Create notifications based on what changed
    if (existingRequest) {
      // Notification for technician assignment
      if (update.assignedTo && (!existingRequest.assignedTo || existingRequest.assignedTo._id.toString() !== update.assignedTo.toString())) {
        await notificationService.notifyMaintenanceRequestAssigned(updated, updated.assignedTo);
        await notificationService.notifyTechnicianAssignedToTask(updated.assignedTo, updated, 'maintenance');
      }

      // Notification for status change
      if (update.status && existingRequest.status !== update.status) {
        await notificationService.notifyMaintenanceRequestStatusUpdate(updated, existingRequest.status, update.status);
        
        // Special notification for completion
        if (update.status === 'Completed') {
          await notificationService.notifyMaintenanceRequestCompleted(updated);
        }
      }
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
    const update = { 
      status: 'Completed',
      completedAt: new Date()  // Record the exact completion timestamp
    };
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

    // 🔄 AUTO-UPDATE EQUIPMENT STATUS TO OPERATIONAL
    if (updated.equipment && updated.equipment.length > 0) {
      const equipmentIds = updated.equipment.map(eq => eq._id);
      await handleMaintenanceRequestCompleted(equipmentIds);
      console.log(`✅ Auto-updated ${equipmentIds.length} equipment items to operational status`);
    }

    // 🔔 Create notification for completion
    await notificationService.notifyMaintenanceRequestCompleted(updated);

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
        // Remove this request from technician's assignedRequests array
        technician.assignedRequests = technician.assignedRequests.filter(
          reqId => reqId.toString() !== id.toString()
        );
        await technician.save();
      }
    }

    await MaintenanceRequest.findByIdAndDelete(id);65

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

/**
 * Export filtered maintenance requests to Excel
 * POST /api/maintenance-requests/export-filtered
 */
exports.exportFilteredMaintenanceRequests = async (req, res) => {
  try {
    const { startDate, endDate, status, priority, technician } = req.body;

    // Build query filters
    const query = {};

    // Date filter for request creation
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Technician filter (search by name or ID - will handle via populate)
    // Note: We'll filter after population since we need to search populated fields
    const technicianFilter = technician;

    // Fetch maintenance requests with filters
    let requests = await MaintenanceRequest.find(query)
      .populate('equipment', 'equipment_id name location')
      .populate('assignedTo', 'name user_id')
      .sort({ createdAt: -1 })
      .lean();

    // Apply technician filter after population (if specified)
    if (technicianFilter) {
      requests = requests.filter(request => {
        if (!request.assignedTo) return false;
        const techName = request.assignedTo.name || '';
        const techId = request.assignedTo.user_id || '';
        const searchTerm = technicianFilter.toLowerCase();
        return techName.toLowerCase().includes(searchTerm) || techId.toLowerCase().includes(searchTerm);
      });
    }

    // Import ExcelJS
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Maintenance Requests');

    // Define columns
    worksheet.columns = [
      { header: 'Request ID', key: 'requestId', width: 15 },
      { header: 'Equipment ID', key: 'equipmentId', width: 15 },
      { header: 'Equipment Name', key: 'equipmentName', width: 25 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Issue Description', key: 'issueDescription', width: 35 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Assigned Technician', key: 'technician', width: 25 },
      { header: 'Request Date', key: 'requestDate', width: 20 },
      { header: 'Completed Date', key: 'completedDate', width: 20 },
      { header: 'Duration (days)', key: 'duration', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' } // Blue color
    };

    // Add data rows
    for (const request of requests) {
      // Calculate duration and completed date
      let duration = 'N/A';
      let completedDate = 'N/A';
      
      if (request.status === 'Completed') {
        // Use completedAt if available, otherwise fall back to updatedAt for old records
        const endDate = request.completedAt || request.updatedAt;
        completedDate = new Date(endDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const days = Math.ceil((new Date(endDate) - new Date(request.createdAt)) / (1000 * 60 * 60 * 24));
        duration = `${days} day${days !== 1 ? 's' : ''}`;
      } else if (request.status !== 'Cancelled') {
        const days = Math.ceil((new Date() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24));
        duration = `${days} day${days !== 1 ? 's' : ''} (ongoing)`;
      }

      // Handle equipment array - can have multiple equipment items
      const equipmentList = request.equipment || [];
      const equipmentIds = equipmentList.map(e => e?.equipment_id).filter(Boolean).join(', ') || 'N/A';
      const equipmentNames = equipmentList.map(e => e?.name).filter(Boolean).join(', ') || 'N/A';
      const locations = equipmentList.map(e => e?.location).filter(Boolean).join(', ') || 'N/A';

      worksheet.addRow({
        requestId: request.request_id || 'N/A',
        equipmentId: equipmentIds,
        equipmentName: equipmentNames,
        location: locations,
        issueDescription: request.description || 'No description',
        priority: request.priority || 'Medium',
        status: request.status || 'Open',
        technician: request.assignedTo?.name || 'Unassigned',
        requestDate: request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A',
        completedDate: completedDate,
        duration: duration
      });
    }

    // Add summary section at the bottom
    worksheet.addRow([]);
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow(['SUMMARY', '', '', '', '', '', '', '', '', '', '']);
    summaryRow.font = { bold: true, size: 12 };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };

    worksheet.addRow(['Total Requests', requests.length]);
    worksheet.addRow(['Open', requests.filter(r => r.status === 'Open').length]);
    worksheet.addRow(['In Progress', requests.filter(r => r.status === 'In Progress').length]);
    worksheet.addRow(['Completed', requests.filter(r => r.status === 'Completed').length]);
    worksheet.addRow(['Cancelled', requests.filter(r => r.status === 'Cancelled').length]);
    
    // Add filter information
    worksheet.addRow([]);
    worksheet.addRow(['FILTERS APPLIED', '', '', '', '', '', '', '', '', '', '']);
    if (startDate) worksheet.addRow(['Start Date', new Date(startDate).toLocaleDateString()]);
    if (endDate) worksheet.addRow(['End Date', new Date(endDate).toLocaleDateString()]);
    if (status) worksheet.addRow(['Status', status]);
    if (priority) worksheet.addRow(['Priority', priority]);
    if (technician) worksheet.addRow(['Technician', technician]);

    // Generate Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=maintenance_report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting maintenance requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export maintenance report',
      error: error.message
    });
  }
};