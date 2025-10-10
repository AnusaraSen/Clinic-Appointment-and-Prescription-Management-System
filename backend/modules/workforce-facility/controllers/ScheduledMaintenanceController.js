const ScheduledMaintenance = require('../models/ScheduledMaintenance');
const Equipment = require('../models/equipments');
const Technician = require('../models/Technician');
const TechnicianController = require('./TechnicianController');
const mongoose = require('mongoose');
const notificationService = require('../../../services/notificationService');
const equipmentStatusService = require('../../../services/equipmentStatusService');

/**
 * Scheduled Maintenance Controller - Clean and focused! 📅
 * 
 * This controller handles ONLY scheduled maintenance operations.
 * All technician-related logic has been moved to TechnicianController
 * for better separation of concerns and cleaner architecture.
 */

/**
 * Get all scheduled maintenance events
 * Perfect for dashboard views and general maintenance listing
 */
const getAllScheduledMaintenance = async (req, res) => {
  try {
    // Get optional filters from query parameters
    const { status, maintenance_type, priority, equipment_id, technician } = req.query;
    
    // Build query with optional filters
    const query = {};
    
    if (status) query.status = status;
    if (maintenance_type) query.maintenance_type = maintenance_type;
    if (priority) query.priority = priority;
    if (equipment_id) query.equipment_id = equipment_id;
    if (technician) query.assigned_technician = technician;
    
    // Fetch scheduled maintenance with populated references
    const scheduledMaintenance = await ScheduledMaintenance.find(query)
      .populate('equipment_id', 'equipment_name location department status')
      .populate('assigned_technician', 'firstName lastName specialization phone availability')
      .sort({ scheduled_date: 1, scheduled_time: 1 })
      .lean();
    
    // Transform data for frontend compatibility
    const transformedEvents = scheduledMaintenance.map(event => ({
      id: event._id,
      _id: event._id, // Include both id and _id for compatibility
      title: event.title,
      description: event.description,
      scheduledDate: event.scheduled_date,
      scheduled_date: event.scheduled_date, // Include both formats for compatibility
      scheduledTime: event.scheduled_time,
      status: event.status,
      priority: event.priority,
      maintenanceType: event.maintenance_type,
      maintenance_type: event.maintenance_type, // Include both formats
      estimatedDuration: event.estimated_duration,
      estimated_duration: event.estimated_duration, // Include both formats
      equipment_id: event.equipment_id, // Include original field name
      equipmentId: event.equipment_id, // Include camelCase version
      equipmentName: event.equipment_id?.equipment_name || 'Unknown Equipment',
      equipmentLocation: event.equipment_id?.location || 'Unknown Location',
      assigned_technician: event.assigned_technician?._id, // Include original field name as ObjectId
      technicianId: event.assigned_technician?._id, // Include camelCase version
      technicianName: event.assigned_technician ? 
        `${event.assigned_technician.firstName} ${event.assigned_technician.lastName}` : 
        event.assigned_technician_name || 'Unassigned',
      notes: event.notes, // Include notes field for editing
      recurrence: event.recurrence?.type || 'none',
      recurrenceInterval: event.recurrence?.interval || 1,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    
    res.json({
      success: true,
      message: `Found ${transformedEvents.length} scheduled maintenance events`,
      data: transformedEvents,
      count: transformedEvents.length
    });
    
  } catch (error) {
    console.error('Error fetching all scheduled maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled maintenance events',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get all scheduled maintenance for a specific month
 * Perfect for calendar views and monthly planning
 */
const getScheduleByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 2020 and 2030',
        data: null
      });
    }
    
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12',
        data: null
      });
    }
    
    // Create date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1); // First day of month
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59); // Last day of month
    
    // Build query with optional filters
    const query = {
      scheduled_date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Add filters from query parameters
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.maintenance_type) {
      query.maintenance_type = req.query.maintenance_type;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    if (req.query.equipment_id) {
      query.equipment_id = req.query.equipment_id.toUpperCase();
    }
    
    if (req.query.technician) {
      query.assigned_technician = req.query.technician;
    }
    
    // Execute query with population
    const scheduledMaintenance = await ScheduledMaintenance.find(query)
      .populate('assigned_technician', 'firstName lastName email phone')
      .sort({ scheduled_date: 1, scheduled_time: 1 });
    
    // Get month statistics
    const stats = await ScheduledMaintenance.getScheduleStats(startDate, endDate);
    
    res.json({
      success: true,
      message: `Found ${scheduledMaintenance.length} scheduled maintenance tasks for ${year}-${month.padStart(2, '0')}`,
      data: {
        schedule: scheduledMaintenance,
        statistics: stats,
        month: `${year}-${month.padStart(2, '0')}`,
        total_count: scheduledMaintenance.length
      }
    });
    
  } catch (error) {
    console.error('Error getting monthly schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve monthly schedule',
      error: error.message,
      data: null
    });
  }
};

/**
 * Create new scheduled maintenance
 * Handles both manual creation and auto-scheduling
 */
const createScheduledMaintenance = async (req, res) => {
  try {
    const {
      equipment_id,
      title,
      description,
      scheduled_date,
      scheduled_time,
      maintenance_type,
      priority,
      estimated_duration,
      assigned_technician,
      notes,
      recurrence
    } = req.body;
    
    // Verify equipment exists
    const equipment = await Equipment.findOne({ equipment_id: equipment_id?.toUpperCase() });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment ${equipment_id} not found`,
        data: null
      });
    }
    
    // Verify technician exists if provided
    let technicianInfo = null;
    if (assigned_technician) {
      technicianInfo = await Technician.findById(assigned_technician);
      if (!technicianInfo) {
        return res.status(404).json({
          success: false,
          message: 'Assigned technician not found',
          data: null
        });
      }
    }
    
    // Create scheduled maintenance
    const scheduledMaintenanceData = {
      equipment_id: equipment_id.toUpperCase(),
      title,
      description: description || '',
      scheduled_date: new Date(scheduled_date),
      scheduled_time: scheduled_time || '09:00',
      maintenance_type: maintenance_type || 'Preventive',
      priority: priority || 'Medium',
      estimated_duration: estimated_duration || 2,
      notes: notes || '',
      
      // Equipment details (cached)
      equipment_name: equipment.name,
      equipment_location: equipment.location,
      
      // Technician assignment
      assigned_technician: assigned_technician || null,
      assigned_technician_name: technicianInfo ? `${technicianInfo.firstName} ${technicianInfo.lastName}` : '',
      status: assigned_technician ? 'Assigned' : 'Scheduled',
      
      // Recurrence settings
      recurrence: recurrence || { type: 'none' }
    };
    
    const newScheduledMaintenance = new ScheduledMaintenance(scheduledMaintenanceData);
    await newScheduledMaintenance.save();
    
    // If this is a recurring maintenance, calculate next due date
    if (recurrence && recurrence.type !== 'none') {
      const nextDueDate = calculateNextDueDate(new Date(scheduled_date), recurrence);
      newScheduledMaintenance.recurrence.next_due_date = nextDueDate;
      await newScheduledMaintenance.save();
    }

    // Add to technician's scheduledMaintenance array if technician is assigned
    if (assigned_technician) {
      try {
        await Technician.findByIdAndUpdate(
          assigned_technician,
          { $addToSet: { scheduledMaintenance: newScheduledMaintenance._id } },
          { new: true }
        );
        console.log(`📥 Added scheduled maintenance ${newScheduledMaintenance._id} to technician ${assigned_technician}`);
      } catch (error) {
        console.warn(`⚠️ Failed to add scheduled maintenance to technician array: ${error.message}`);
      }
    }
    
    // Populate technician info for response
    await newScheduledMaintenance.populate('assigned_technician', 'firstName lastName email phone');
    
    // 🔔 Create notification for new scheduled maintenance
    await notificationService.notifyScheduledMaintenanceCreated(newScheduledMaintenance);
    
    res.status(201).json({
      success: true,
      message: `Scheduled maintenance created successfully`,
      data: newScheduledMaintenance
    });
    
  } catch (error) {
    console.error('Error creating scheduled maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduled maintenance',
      error: error.message,
      data: null
    });
  }
};

/**
 * Update scheduled maintenance task
 * PUT /api/scheduled-maintenance/:id
 */
const updateScheduledMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid maintenance task ID',
        data: null
      });
    }

    // If assigned_technician is being updated, get technician name
    if (updateData.assigned_technician) {
      try {
        const technician = await Technician.findById(updateData.assigned_technician);
        if (technician) {
          updateData.assigned_technician_name = `${technician.firstName} ${technician.lastName}`;
        } else {
          return res.status(404).json({
            success: false,
            message: 'Assigned technician not found',
            data: null
          });
        }
      } catch (techError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid technician ID',
          data: null
        });
      }
    } else if (updateData.assigned_technician === null || updateData.assigned_technician === '') {
      // If technician is being unassigned
      updateData.assigned_technician = null;
      updateData.assigned_technician_name = '';
    }

    // Find and update the maintenance task
    const oldMaintenance = await ScheduledMaintenance.findById(id);
    if (!oldMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found',
        data: null
      });
    }

    const updatedMaintenance = await ScheduledMaintenance.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('equipment_id')
     .populate('assigned_technician');

    if (!updatedMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found',
        data: null
      });
    }

    // Update technician's scheduledMaintenance array if technician assignment changed
    const oldTechnicianId = oldMaintenance.assigned_technician?.toString();
    const newTechnicianId = updatedMaintenance.assigned_technician?._id?.toString();

    if (oldTechnicianId !== newTechnicianId) {
      // Remove from old technician's array if there was one
      if (oldTechnicianId) {
        try {
          await Technician.findByIdAndUpdate(
            oldTechnicianId,
            { $pull: { scheduledMaintenance: id } },
            { new: true }
          );
          console.log(`📤 Removed scheduled maintenance ${id} from technician ${oldTechnicianId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to remove scheduled maintenance from old technician: ${error.message}`);
        }
      }

      // Add to new technician's array if there is one
      if (newTechnicianId) {
        try {
          await Technician.findByIdAndUpdate(
            newTechnicianId,
            { $addToSet: { scheduledMaintenance: id } },
            { new: true }
          );
          console.log(`📥 Added scheduled maintenance ${id} to technician ${newTechnicianId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to add scheduled maintenance to new technician: ${error.message}`);
        }
      }
    }

    // Transform the response to include both original and camelCase field names for frontend compatibility
    const responseData = {
      ...updatedMaintenance.toObject(),
      technicianName: updatedMaintenance.assigned_technician ? 
        `${updatedMaintenance.assigned_technician.firstName} ${updatedMaintenance.assigned_technician.lastName}` : 
        updatedMaintenance.assigned_technician_name || 'Unassigned',
      equipmentName: updatedMaintenance.equipment_id?.equipment_name || 'Unknown Equipment'
    };

    res.status(200).json({
      success: true,
      message: 'Maintenance task updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error updating scheduled maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance task',
      error: error.message,
      data: null
    });
  }
};

/**
 * Assign technician to scheduled maintenance
 * Now uses TechnicianController for clean separation of concerns
 */
const assignTechnician = async (req, res) => {
  try {
    // Delegate to TechnicianController
    await TechnicianController.assignTechnicianToMaintenance(req, res);
  } catch (error) {
    console.error('Error in assignTechnician delegation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign technician',
      error: error.message,
      data: null
    });
  }
};

/**
 * Update maintenance status
 * Handles status transitions and business logic
 */
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const scheduledMaintenance = await ScheduledMaintenance.findById(id);
    if (!scheduledMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled maintenance not found',
        data: null
      });
    }
    
    // Validate that the status is one of the allowed values from the schema
    const allowedStatuses = ['Scheduled', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Allowed statuses: ${allowedStatuses.join(', ')}`,
        data: null
      });
    }
    
    // Update status - no strict transition validation
    scheduledMaintenance.status = status;
    
    // Handle additional fields from frontend
    if (req.body.technician_notes) {
      scheduledMaintenance.technician_notes = req.body.technician_notes;
    }
    if (req.body.status_updated_by) {
      scheduledMaintenance.status_updated_by = req.body.status_updated_by;
    }
    if (req.body.status_history) {
      if (!scheduledMaintenance.status_history) {
        scheduledMaintenance.status_history = [];
      }
      scheduledMaintenance.status_history.push(req.body.status_history);
    }
    
    // Update timestamps
    scheduledMaintenance.updated_at = new Date();
    if (status === 'Completed') {
      scheduledMaintenance.completed_at = new Date();
    }
    
    if (notes) {
      scheduledMaintenance.notes = notes;
    }
    
    await scheduledMaintenance.save();
    
    // � Auto-update equipment status based on maintenance status
    const equipment = await Equipment.findById(scheduledMaintenance.equipment_id);
    if (equipment) {
      if (status === 'In Progress') {
        // Set equipment to "Under Maintenance" when work starts
        await Equipment.findByIdAndUpdate(
          equipment._id,
          { status: 'Under Maintenance' },
          { new: true }
        );
      } else if (status === 'Completed') {
        // Set equipment back to "Operational" when maintenance is done
        await equipmentStatusService.updateEquipmentStatusOnMaintenanceCompletion(equipment._id);
      }
    }
    
    // �🔔 Create notification for status update
    if (status === 'Completed') {
      await notificationService.notifyScheduledMaintenanceCompleted(scheduledMaintenance);
    }
    
    res.json({
      success: true,
      message: `Maintenance status updated to ${status}`,
      data: scheduledMaintenance
    });
    
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance status',
      error: error.message,
      data: null
    });
  }
};

/**
 * Complete scheduled maintenance
 * Handles completion logic and auto-scheduling next occurrence
 */
const completeScheduledMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      completion_notes, 
      actual_duration, 
      actual_cost,
      equipment_status_after 
    } = req.body;
    
    const scheduledMaintenance = await ScheduledMaintenance.findById(id);
    if (!scheduledMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled maintenance not found',
        data: null
      });
    }
    
    if (scheduledMaintenance.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Maintenance is already completed',
        data: null
      });
    }
    
    // Update completion details
    scheduledMaintenance.status = 'Completed';
    scheduledMaintenance.completion_notes = completion_notes || '';
    scheduledMaintenance.actual_duration = actual_duration || scheduledMaintenance.estimated_duration;
    scheduledMaintenance.actual_cost = actual_cost || 0;
    scheduledMaintenance.completed_date = new Date();
    
    await scheduledMaintenance.save();
    
    // Automatically update equipment status back to Operational after maintenance completion
    const equipment = await Equipment.findById(scheduledMaintenance.equipment_id);
    if (equipment) {
      await equipmentStatusService.updateEquipmentStatusOnMaintenanceCompletion(equipment._id);
    }
    
    // Update equipment status if provided (override automatic behavior if specified)
    if (equipment_status_after && equipment) {
      await Equipment.findByIdAndUpdate(
        equipment._id,
        { 
          status: equipment_status_after,
          lastMaintenance: new Date()
        }
      );
    }
    
    // Notify equipment controller about completion
    try {
      const { handleScheduledMaintenanceCompleted } = require('./EquipmentController');
      await handleScheduledMaintenanceCompleted(scheduledMaintenance._id);
    } catch (equipmentError) {
      console.warn('Failed to update equipment after scheduled maintenance completion:', equipmentError.message);
    }
    
    // Schedule next occurrence if recurring
    let nextScheduled = null;
    if (scheduledMaintenance.recurrence.type !== 'none') {
      nextScheduled = await scheduleNextOccurrence(scheduledMaintenance);
    }
    
    res.json({
      success: true,
      message: 'Maintenance completed successfully',
      data: {
        completed_maintenance: scheduledMaintenance,
        next_scheduled: nextScheduled
      }
    });
    
  } catch (error) {
    console.error('Error completing maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete maintenance',
      error: error.message,
      data: null
    });
  }
};

/**
 * Get available technicians for a specific date and time
 * Now delegates to TechnicianController
 */
const getAvailableTechnicians = async (req, res) => {
  try {
    // Delegate to TechnicianController
    await TechnicianController.getAvailableTechnicians(req, res);
  } catch (error) {
    console.error('Error in getAvailableTechnicians delegation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available technicians',
      error: error.message,
      data: null
    });
  }
};

/**
 * Get technician's schedule for a specific month
 * Now delegates to TechnicianController
 */
const getTechnicianSchedule = async (req, res) => {
  try {
    // Transform the request parameters to match TechnicianController expectations
    req.query.month = req.params.month;
    req.query.year = req.params.year;
    req.params.technicianId = req.params.technicianId;
    
    // Delegate to TechnicianController
    await TechnicianController.getTechnicianSchedule(req, res);
  } catch (error) {
    console.error('Error in getTechnicianSchedule delegation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get technician schedule',
      error: error.message,
      data: null
    });
  }
};

/**
 * Auto-schedule preventive maintenance for equipment
 * Called when new equipment is added or after maintenance completion
 */
const autoScheduleForEquipment = async (equipmentId, maintenanceType = 'Preventive') => {
  try {
    // Get equipment details
    const equipment = await Equipment.findOne({ equipment_id: equipmentId });
    if (!equipment) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }
    
    // Define maintenance intervals by equipment type
    const maintenanceIntervals = {
      'Blood Pressure Monitor': { months: 3, duration: 1 },
      'X-Ray Machine': { months: 6, duration: 4 },
      'Ultrasound Machine': { months: 4, duration: 2 },
      'ECG Machine': { months: 3, duration: 1 },
      'Defibrillator': { months: 2, duration: 2 },
      'Ventilator': { months: 1, duration: 3 },
      'default': { months: 6, duration: 2 }
    };
    
    const interval = maintenanceIntervals[equipment.type] || maintenanceIntervals.default;
    
    // Calculate next maintenance date
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + interval.months);
    
    // Create scheduled maintenance
    const scheduledMaintenance = new ScheduledMaintenance({
      equipment_id: equipmentId,
      title: `${equipment.type} - ${maintenanceType} Maintenance`,
      description: `Scheduled ${maintenanceType.toLowerCase()} maintenance for ${equipment.name}`,
      scheduled_date: nextDate,
      scheduled_time: '09:00',
      maintenance_type: maintenanceType,
      priority: equipment.criticality === 'Critical' ? 'High' : 'Medium',
      estimated_duration: interval.duration,
      equipment_name: equipment.name,
      equipment_location: equipment.location,
      recurrence: {
        type: 'monthly',
        interval: interval.months,
        next_due_date: null
      }
    });
    
    await scheduledMaintenance.save();
    
    return scheduledMaintenance;
    
  } catch (error) {
    console.error('Error auto-scheduling maintenance:', error);
    throw error;
  }
};

/**
 * Helper function to calculate next due date for recurring maintenance
 */
const calculateNextDueDate = (currentDate, recurrence) => {
  const nextDate = new Date(currentDate);
  
  switch (recurrence.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + (recurrence.interval || 1));
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * (recurrence.interval || 1)));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + (recurrence.interval || 1));
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + (3 * (recurrence.interval || 1)));
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + (recurrence.interval || 1));
      break;
    default:
      return null;
  }
  
  return nextDate;
};

/**
 * Helper function to schedule next occurrence of recurring maintenance
 */
const scheduleNextOccurrence = async (completedMaintenance) => {
  try {
    if (completedMaintenance.recurrence.type === 'none') {
      return null;
    }
    
    // Check if we've reached the end date
    if (completedMaintenance.recurrence.end_date && 
        new Date() >= completedMaintenance.recurrence.end_date) {
      return null;
    }
    
    const nextDate = calculateNextDueDate(
      completedMaintenance.scheduled_date, 
      completedMaintenance.recurrence
    );
    
    if (!nextDate) return null;
    
    // Create next scheduled maintenance
    const nextMaintenance = new ScheduledMaintenance({
      equipment_id: completedMaintenance.equipment_id,
      title: completedMaintenance.title,
      description: completedMaintenance.description,
      scheduled_date: nextDate,
      scheduled_time: completedMaintenance.scheduled_time,
      maintenance_type: completedMaintenance.maintenance_type,
      priority: completedMaintenance.priority,
      estimated_duration: completedMaintenance.estimated_duration,
      equipment_name: completedMaintenance.equipment_name,
      equipment_location: completedMaintenance.equipment_location,
      recurrence: completedMaintenance.recurrence
    });
    
    await nextMaintenance.save();
    return nextMaintenance;
    
  } catch (error) {
    console.error('Error scheduling next occurrence:', error);
    throw error;
  }
};

module.exports = {
  getAllScheduledMaintenance,
  getScheduleByMonth,
  createScheduledMaintenance,
  updateScheduledMaintenance,
  assignTechnician,
  updateMaintenanceStatus,
  completeScheduledMaintenance,
  getAvailableTechnicians,
  getTechnicianSchedule,
  autoScheduleForEquipment
};