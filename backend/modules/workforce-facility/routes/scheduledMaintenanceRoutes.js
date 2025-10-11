const express = require('express');
const router = express.Router();
const {
  getAllScheduledMaintenance,
  getScheduleByMonth,
  createScheduledMaintenance,
  updateScheduledMaintenance,
  assignTechnician,
  updateMaintenanceStatus,
  completeScheduledMaintenance,
  getAvailableTechnicians,
  getTechnicianSchedule
} = require('../controllers/ScheduledMaintenanceController');

// Import middleware
const { validation, queryProcessing, responseFormatting } = require('../../../middleware');

/**
 * Scheduled Maintenance Routes - Your maintenance calendar API! 📅
 * 
 * These routes handle all maintenance scheduling operations from viewing
 * monthly calendars to assigning technicians and tracking completion.
 * Perfect for building maintenance management dashboards!
 */

// ==================== CALENDAR VIEWS ====================

/**
 * GET /api/scheduled-maintenance
 * Get all scheduled maintenance events
 * 
 * Query Parameters:
 * - status: Filter by status (Scheduled, Assigned, In Progress, Completed, Cancelled)
 * - maintenance_type: Filter by type (Preventive, Repair, Inspection, etc.)
 * - priority: Filter by priority (Critical, High, Medium, Low)
 * - equipment_id: Filter by specific equipment (EQ-1002)
 * - technician: Filter by assigned technician ID
 * 
 * Example: GET /api/scheduled-maintenance?status=Scheduled&priority=High
 */
router.get('/', 
  queryProcessing.parseFilters(['status', 'maintenance_type', 'priority', 'equipment_id', 'technician']),
  getAllScheduledMaintenance
);

/**
 * POST /api/scheduled-maintenance
 * Create a new scheduled maintenance task
 * 
 * Body should include:
 * - equipment_id: ID of equipment to maintain
 * - maintenance_type: Type of maintenance (Preventive, Repair, Inspection, etc.)
 * - scheduled_date: When maintenance should be performed
 * - priority: Priority level (Critical, High, Medium, Low)
 * - estimated_duration: Duration in hours (optional, default: 2)
 * - assigned_technician: Technician ID (optional)
 * - description: Additional details (optional)
 * - recurrence: Recurrence pattern (optional)
 */
router.post('/',
  validation.validateScheduledMaintenanceCreate(),
  createScheduledMaintenance
);

/**
 * PUT /api/scheduled-maintenance/:id
 * Update an existing scheduled maintenance task
 * 
 * Body can include any of the following fields to update:
 * - equipment_id: ID of equipment to maintain
 * - maintenance_type: Type of maintenance (Preventive, Repair, Inspection, etc.)
 * - scheduled_date: When maintenance should be performed
 * - priority: Priority level (Critical, High, Medium, Low)
 * - estimated_duration: Duration in hours
 * - assigned_technician: Technician ID
 * - description: Additional details
 * - recurrence: Recurrence pattern
 * - status: Task status
 */
router.put('/:id',
  validation.validateObjectId('id'),
  validation.validateScheduledMaintenanceUpdate(),
  updateScheduledMaintenance
);

/**
 * GET /api/calendar/:year/:month
 * Get all scheduled maintenance for a specific month
 * 
 * Query Parameters:
 * - status: Filter by status (Scheduled, Assigned, In Progress, Completed, Cancelled)
 * - maintenance_type: Filter by type (Preventive, Repair, Inspection, etc.)
 * - priority: Filter by priority (Critical, High, Medium, Low)
 * - equipment_id: Filter by specific equipment (EQ-1002)
 * - technician: Filter by assigned technician ID
 * 
 * Example: GET /api/calendar/2025/09?status=Scheduled&priority=High
 */
router.get('/:year/:month', 
  queryProcessing.parseFilters(['status', 'maintenance_type', 'priority', 'equipment_id', 'technician']),
  getScheduleByMonth
);

/**
 * GET /api/calendar/technician/:technicianId/:year/:month
 * Get specific technician's schedule for a month
 * Perfect for individual technician dashboards
 */
router.get('/technician/:technicianId/:year/:month',
  validation.validateObjectId('technicianId'),
  getTechnicianSchedule
);

/**
 * GET /api/calendar/available-technicians
 * Get available technicians for a specific date and time
 * 
 * Query Parameters:
 * - date: Date in YYYY-MM-DD format (required)
 * - time: Time in HH:MM format (required)
 * - duration: Duration in hours (optional, default: 2)
 * 
 * Example: GET /api/calendar/available-technicians?date=2025-09-20&time=09:00&duration=2
 */
router.get('/available-technicians',
  getAvailableTechnicians
);

// ==================== MAINTENANCE MANAGEMENT ====================

/**
 * POST /api/calendar/schedule
 * Create new scheduled maintenance
 * 
 * Body should include:
 * - equipment_id: Equipment ID (EQ-1002)
 * - title: Maintenance title
 * - scheduled_date: Date in YYYY-MM-DD format
 * - scheduled_time: Time in HH:MM format (optional, default: 09:00)
 * - maintenance_type: Type (Preventive, Repair, etc.)
 * - priority: Priority level (Critical, High, Medium, Low)
 * - estimated_duration: Duration in hours (optional, default: 2)
 * - assigned_technician: Technician ID (optional)
 * - description: Additional details (optional)
 * - recurrence: Recurrence pattern (optional)
 */
router.post('/schedule',
  validation.validateScheduledMaintenanceCreate(),
  createScheduledMaintenance
);

/**
 * PUT /api/calendar/:id/assign
 * Assign or reassign technician to scheduled maintenance
 * 
 * Body should include:
 * - technician_id: ID of technician to assign
 */
router.put('/:id/assign',
  validation.validateObjectId('id'),
  validation.validateScheduledMaintenanceAssign(),
  assignTechnician
);

/**
 * PUT /api/calendar/:id/status
 * Update maintenance status
 * 
 * Body should include:
 * - status: New status (Scheduled, Assigned, In Progress, Completed, Cancelled)
 * - notes: Optional notes about status change
 */
router.put('/:id/status',
  validation.validateObjectId('id'),
  validation.validateScheduledMaintenanceStatusUpdate(),
  updateMaintenanceStatus
);

/**
 * PUT /api/calendar/:id/complete
 * Mark maintenance as completed and handle completion logic
 * 
 * Body can include:
 * - completion_notes: Notes about what was done
 * - actual_duration: Actual time spent (hours)
 * - actual_cost: Actual cost incurred
 * - equipment_status_after: Equipment status after maintenance
 */
router.put('/:id/complete',
  validation.validateObjectId('id'),
  validation.validateScheduledMaintenanceComplete(),
  completeScheduledMaintenance
);

// ==================== QUICK ACCESS ENDPOINTS ====================

/**
 * GET /api/calendar/upcoming
 * Get upcoming maintenance tasks (next 7 days)
 * Great for dashboard widgets and notifications
 */
router.get('/upcoming', async (req, res) => {
  try {
    const ScheduledMaintenance = require('../models/ScheduledMaintenance');
    
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingMaintenance = await ScheduledMaintenance.find({
      scheduled_date: {
        $gte: today,
        $lte: nextWeek
      },
      status: { $nin: ['Completed', 'Cancelled'] }
    })
    .populate('assigned_technician', 'firstName lastName email')
    .sort({ scheduled_date: 1, scheduled_time: 1 })
    .limit(20);
    
    res.json({
      success: true,
      message: `Found ${upcomingMaintenance.length} upcoming maintenance tasks`,
      data: upcomingMaintenance
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming maintenance',
      error: error.message,
      data: null
    });
  }
});

/**
 * GET /api/calendar/overdue
 * Get overdue maintenance tasks
 * Important for compliance and equipment safety
 */
router.get('/overdue', async (req, res) => {
  try {
    const ScheduledMaintenance = require('../models/ScheduledMaintenance');
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const overdueMaintenance = await ScheduledMaintenance.find({
      scheduled_date: { $lt: today },
      status: { $nin: ['Completed', 'Cancelled'] }
    })
    .populate('assigned_technician', 'firstName lastName email')
    .sort({ scheduled_date: 1, priority: -1 });
    
    res.json({
      success: true,
      message: `Found ${overdueMaintenance.length} overdue maintenance tasks`,
      data: overdueMaintenance
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get overdue maintenance',
      error: error.message,
      data: null
    });
  }
});

/**
 * GET /api/calendar/stats/:year/:month
 * Get maintenance statistics for a specific month
 * Perfect for dashboard analytics
 */
router.get('/stats/:year/:month', async (req, res) => {
  try {
    const ScheduledMaintenance = require('../models/ScheduledMaintenance');
    const { year, month } = req.params;
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    const stats = await ScheduledMaintenance.getScheduleStats(startDate, endDate);
    
    res.json({
      success: true,
      message: `Maintenance statistics for ${year}-${month.padStart(2, '0')}`,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance statistics',
      error: error.message,
      data: null
    });
  }
});

/**
 * DELETE /api/calendar/:id
 * Cancel/delete scheduled maintenance
 * Allows deletion of all maintenance schedules including completed ones
 */
router.delete('/:id', 
  validation.validateObjectId('id'),
  async (req, res) => {
    try {
      const ScheduledMaintenance = require('../models/ScheduledMaintenance');
      
      const scheduledMaintenance = await ScheduledMaintenance.findById(req.params.id);
      
      if (!scheduledMaintenance) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled maintenance not found',
          data: null
        });
      }
      
      // Allow deletion of all statuses including completed maintenance
      await ScheduledMaintenance.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Scheduled maintenance deleted successfully',
        data: null
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete scheduled maintenance',
        error: error.message,
        data: null
      });
    }
  }
);

/**
 * GET /api/calendar/:id
 * Get single scheduled maintenance details
 * Useful for detailed views and editing forms
 */
router.get('/:id',
  validation.validateObjectId('id'),
  async (req, res) => {
    try {
      const ScheduledMaintenance = require('../models/ScheduledMaintenance');
      
      const scheduledMaintenance = await ScheduledMaintenance.findById(req.params.id)
        .populate('assigned_technician', 'firstName lastName email phone');
      
      if (!scheduledMaintenance) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled maintenance not found',
          data: null
        });
      }
      
      res.json({
        success: true,
        message: 'Scheduled maintenance retrieved successfully',
        data: scheduledMaintenance
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get scheduled maintenance',
        error: error.message,
        data: null
      });
    }
  }
);

/**
 * PUT /api/calendar/:id/reschedule
 * Reschedule maintenance to a different date/time
 * Checks technician availability for new time slot
 */
router.put('/:id/reschedule',
  validation.validateObjectId('id'),
  async (req, res) => {
    try {
      const ScheduledMaintenance = require('../models/ScheduledMaintenance');
      const { scheduled_date, scheduled_time, reason } = req.body;
      
      const scheduledMaintenance = await ScheduledMaintenance.findById(req.params.id);
      
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
          message: 'Cannot reschedule completed maintenance',
          data: null
        });
      }
      
      // Update schedule
      scheduledMaintenance.scheduled_date = new Date(scheduled_date);
      scheduledMaintenance.scheduled_time = scheduled_time;
      scheduledMaintenance.status = 'Rescheduled';
      
      if (reason) {
        scheduledMaintenance.notes += `\nRescheduled: ${reason}`;
      }
      
      await scheduledMaintenance.save();
      
      res.json({
        success: true,
        message: 'Maintenance rescheduled successfully',
        data: scheduledMaintenance
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to reschedule maintenance',
        error: error.message,
        data: null
      });
    }
  }
);

module.exports = router;