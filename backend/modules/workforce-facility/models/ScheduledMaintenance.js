const mongoose = require('mongoose');

/**
 * Scheduled Maintenance Model - Proactive maintenance scheduling! 📅
 * 
 * This model handles all scheduled maintenance activities - from routine
 * preventive maintenance to planned repairs. It connects equipment with
 * technicians and ensures nothing gets forgotten!
 */
const scheduledMaintenanceSchema = new mongoose.Schema({
  schedule_id: { 
    type: String, 
    uppercase: true, 
    trim: true 
    // Auto-generated as SM-001, SM-002, etc.
  },
  
  equipment_id: { 
    type: String, 
    required: [true, 'Which equipment needs maintenance?'], 
    trim: true,
    uppercase: true
    // Links to Equipment using equipment_id (EQ-1002, etc.)
  },
  
  title: { 
    type: String, 
    required: [true, 'What maintenance is being performed?'], 
    trim: true,
    maxlength: [100, 'Title too long - keep it under 100 characters']
  },
  
  description: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Description too long - keep it under 500 characters'],
    default: ''
  },
  
  scheduled_date: { 
    type: Date, 
    required: [true, 'When is this maintenance scheduled?'],
    index: true // For efficient calendar queries
  },
  
  scheduled_time: { 
    type: String, 
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (24-hour)'],
    default: '09:00'
  },
  
  assigned_technician: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Technician',
    default: null // Can be unassigned initially
  },
  
  assigned_technician_name: { 
    type: String, 
    trim: true,
    default: '' // For quick display without populating
  },
  
  status: {
    type: String,
    enum: {
      values: ['Scheduled', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'],
      message: 'Status must be: Scheduled, Assigned, In Progress, Completed, Cancelled, or Rescheduled'
    },
    default: 'Scheduled',
    index: true
  },
  
  maintenance_type: {
    type: String,
    enum: {
      values: ['Preventive', 'Repair', 'Inspection', 'Calibration', 'Cleaning'],
      message: 'Type must be: Preventive, Repair, Inspection, Calibration, or Cleaning'
    },
    required: [true, 'What type of maintenance is this?'],
    default: 'Preventive'
  },
  
  estimated_duration: { 
    type: Number, 
    min: [0.5, 'Duration must be at least 30 minutes'],
    max: [8, 'Duration cannot exceed 8 hours'],
    default: 2 // 2 hours default
  },
  
  priority: {
    type: String,
    enum: {
      values: ['Critical', 'High', 'Medium', 'Low'],
      message: 'Priority must be: Critical, High, Medium, or Low'
    },
    default: 'Medium',
    index: true
  },
  
  notes: { 
    type: String, 
    trim: true,
    maxlength: [1000, 'Notes too long - keep it under 1000 characters'],
    default: ''
  },
  
  completion_notes: { 
    type: String, 
    trim: true,
    maxlength: [1000, 'Completion notes too long - keep it under 1000 characters'],
    default: ''
  },
  
  actual_duration: { 
    type: Number, 
    min: [0, 'Actual duration cannot be negative'],
    default: null // Set when completed
  },
  
  completed_date: { 
    type: Date, 
    default: null // Set when status becomes 'Completed'
  },
  
  // Recurrence pattern for repeated maintenance
  recurrence: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'none'
    },
    interval: {
      type: Number,
      min: 1,
      default: 1 // Every 1 month, 2 weeks, etc.
    },
    next_due_date: {
      type: Date,
      default: null // When should the next occurrence be scheduled?
    },
    end_date: {
      type: Date,
      default: null // When should recurring maintenance stop?
    }
  },
  
  // Equipment details (cached for quick access)
  equipment_name: { 
    type: String, 
    trim: true,
    default: ''
  },
  
  equipment_location: { 
    type: String, 
    trim: true,
    default: ''
  },
  
  // Cost tracking
  estimated_cost: { 
    type: Number, 
    min: [0, 'Cost cannot be negative'], 
    default: 0
  },
  
  actual_cost: { 
    type: Number, 
    min: [0, 'Actual cost cannot be negative'], 
    default: 0
  }
}, {
  timestamps: true, // createdAt and updatedAt
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Indexes for efficient queries
scheduledMaintenanceSchema.index({ schedule_id: 1 }, { unique: true });
scheduledMaintenanceSchema.index({ equipment_id: 1 });
scheduledMaintenanceSchema.index({ assigned_technician: 1 });
scheduledMaintenanceSchema.index({ scheduled_date: 1, status: 1 });
scheduledMaintenanceSchema.index({ status: 1, priority: 1 });

// Virtual for formatted scheduled date and time
scheduledMaintenanceSchema.virtual('scheduled_datetime').get(function() {
  if (this.scheduled_date && this.scheduled_time) {
    const date = this.scheduled_date.toISOString().split('T')[0];
    return `${date} ${this.scheduled_time}`;
  }
  return null;
});

// Virtual for days until scheduled
scheduledMaintenanceSchema.virtual('days_until_scheduled').get(function() {
  if (this.scheduled_date) {
    const today = new Date();
    const scheduled = new Date(this.scheduled_date);
    const diffTime = scheduled - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for overdue status
scheduledMaintenanceSchema.virtual('is_overdue').get(function() {
  if (this.scheduled_date && this.status !== 'Completed' && this.status !== 'Cancelled') {
    const today = new Date();
    const scheduled = new Date(this.scheduled_date);
    return scheduled < today;
  }
  return false;
});

/**
 * Pre-save middleware to auto-generate schedule_id and update technician name
 * Format: SM-001, SM-002, SM-003, etc.
 */
scheduledMaintenanceSchema.pre('save', async function(next) {
  if (this.isNew && !this.schedule_id) {
    try {
      // Find the highest existing schedule_id
      const lastSchedule = await this.constructor.findOne(
        { schedule_id: { $regex: /^SM-\d+$/ } },
        { schedule_id: 1 },
        { sort: { schedule_id: -1 } }
      );

      let nextNumber = 1;
      if (lastSchedule && lastSchedule.schedule_id) {
        const lastNumber = parseInt(lastSchedule.schedule_id.split('-')[1]);
        nextNumber = lastNumber + 1;
      }

      // Generate new schedule_id with zero-padding
      this.schedule_id = `SM-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Update technician name when assigned_technician changes
  if (this.isModified('assigned_technician')) {
    if (this.assigned_technician) {
      try {
        const Technician = require('./Technician');
        const technician = await Technician.findById(this.assigned_technician);
        if (technician) {
          this.assigned_technician_name = `${technician.firstName} ${technician.lastName}`;
        }
      } catch (error) {
        console.warn('Could not update technician name:', error.message);
        // Don't block the save operation if technician lookup fails
      }
    } else {
      this.assigned_technician_name = '';
    }
  }
  
  // Update completion date when status changes to Completed
  if (this.isModified('status') && this.status === 'Completed' && !this.completed_date) {
    this.completed_date = new Date();
  }
  
  next();
});

/**
 * Static method to get schedule statistics
 */
scheduledMaintenanceSchema.statics.getScheduleStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        scheduled_date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalScheduled: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        scheduled: { $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] } },
        overdue: { $sum: { $cond: [{ 
          $and: [
            { $lt: ['$scheduled_date', new Date()] },
            { $nin: ['$status', ['Completed', 'Cancelled']] }
          ]
        }, 1, 0] } },
        preventive: { $sum: { $cond: [{ $eq: ['$maintenance_type', 'Preventive'] }, 1, 0] } },
        repair: { $sum: { $cond: [{ $eq: ['$maintenance_type', 'Repair'] }, 1, 0] } },
        avgDuration: { $avg: '$estimated_duration' },
        totalCost: { $sum: '$actual_cost' }
      }
    }
  ]);

  return stats[0] || {
    totalScheduled: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    overdue: 0,
    preventive: 0,
    repair: 0,
    avgDuration: 0,
    totalCost: 0
  };
};

/**
 * Static method to find available time slots
 */
scheduledMaintenanceSchema.statics.findAvailableSlots = async function(date, duration = 2) {
  const startOfDay = new Date(date);
  startOfDay.setHours(8, 0, 0, 0); // 8 AM start
  
  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0); // 5 PM end
  
  const existingSchedules = await this.find({
    scheduled_date: {
      $gte: startOfDay,
      $lt: endOfDay
    },
    status: { $nin: ['Completed', 'Cancelled'] }
  }).sort({ scheduled_time: 1 });
  
  // Simple logic - return time slots not conflicting with existing schedules
  const availableSlots = [];
  const workingHours = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  
  for (const slot of workingHours) {
    const hasConflict = existingSchedules.some(schedule => {
      return schedule.scheduled_time === slot;
    });
    
    if (!hasConflict) {
      availableSlots.push(slot);
    }
  }
  
  return availableSlots;
};

const ScheduledMaintenance = mongoose.model('ScheduledMaintenance', scheduledMaintenanceSchema);

module.exports = ScheduledMaintenance;