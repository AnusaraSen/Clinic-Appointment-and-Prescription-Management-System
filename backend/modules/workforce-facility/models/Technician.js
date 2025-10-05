const mongoose = require('mongoose');

/**
 * Technician Schema
 * Simplified for essential fields only
 */
const technicianSchema = new mongoose.Schema({
  technician_id: {
    type: String,
    required: [true, 'Technician ID is required'],
    uppercase: true,
    trim: true,
    match: [/^T\d{3}$/, 'Technician ID must match T### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: 50
  },
  // Keep old 'name' field for backward compatibility
  name: {
    type: String,
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number']
  },
  specialization: {
    type: String,
    trim: true
  },
  // Enhanced skills for better equipment matching
  skills: [{
    type: String,
    trim: true
    // Examples: ['Blood Pressure Monitor', 'X-Ray Machine', 'Ultrasound', 'ECG', 'General Repair']
  }],
  // Department and location information
  department: {
    type: String,
    trim: true,
    default: 'Maintenance'
  },
  location: {
    type: String,
    trim: true,
    default: 'Main Building'
  },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'day'],
    default: 'day'
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'on leave', 'off duty'],
    default: 'available'
  },
  experienceLevel: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  // Emergency contact information
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          // Allow empty values or valid phone numbers
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Invalid emergency contact phone number'
      }
    },
    relationship: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    }
  },
  availability: { 
    type: Boolean, 
    default: true 
  },
  // Current assignments
  assignedRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }],
  // Scheduled maintenance assignments
  scheduledMaintenance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledMaintenance'
  }]
}, {
  timestamps: true,
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

/* Virtuals */
technicianSchema.virtual('isCurrentlyEmployed').get(function() {
  return this.availability === true;
});

technicianSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || 'Unknown Technician';
});

technicianSchema.virtual('currentWorkload').get(function() {
  const assigned = Array.isArray(this.assignedRequests) ? this.assignedRequests.length : 0;
  const scheduled = Array.isArray(this.scheduledMaintenance) ? this.scheduledMaintenance.length : 0;
  return {
    maintenance_requests: assigned,
    scheduled_maintenance: scheduled,
    total: assigned + scheduled
  };
});

/* Instance methods */
technicianSchema.methods.canAcceptNewRequest = function() {
  const assigned = Array.isArray(this.assignedRequests) ? this.assignedRequests.length : 0;
  return this.availability && assigned < 5 && this.isCurrentlyEmployed;
};

technicianSchema.methods.canAcceptScheduledMaintenance = function() {
  const scheduled = Array.isArray(this.scheduledMaintenance) ? this.scheduledMaintenance.length : 0;
  return this.availability && scheduled < 3 && this.isCurrentlyEmployed;
};

technicianSchema.methods.hasSkillForEquipment = function(equipmentType) {
  if (!this.skills || this.skills.length === 0) {
    return true; // If no skills specified, assume general technician
  }
  
  // Check for exact match or 'General Repair' skill
  return this.skills.includes(equipmentType) || this.skills.includes('General Repair');
};

/* Pre-save middleware to maintain backward compatibility */
technicianSchema.pre('save', function(next) {
  // If firstName and lastName are provided but name is not, set name
  if (this.firstName && this.lastName && !this.name) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  
  // If name is provided but firstName/lastName are not, try to split
  if (this.name && !this.firstName && !this.lastName) {
    const nameParts = this.name.trim().split(' ');
    if (nameParts.length >= 2) {
      this.firstName = nameParts[0];
      this.lastName = nameParts.slice(1).join(' ');
    } else {
      this.firstName = this.name;
      this.lastName = '';
    }
  }
  
  next();
});

/* Indexes */
technicianSchema.index({ technician_id: 1 }, { unique: true });
technicianSchema.index({ user: 1 });
technicianSchema.index({ specialization: 1, availability: 1 });
technicianSchema.index({ skills: 1 });
technicianSchema.index({ availability: 1 });
technicianSchema.index({ email: 1 }, { unique: true, sparse: true });

/* Static methods for scheduled maintenance */
technicianSchema.statics.findAvailableForEquipment = async function(equipmentType) {
  const technicians = await this.find({
    availability: true
  });
  
  const availableTechnicians = [];
  
  for (const technician of technicians) {
    // Check if technician has required skills
    if (!technician.hasSkillForEquipment(equipmentType)) {
      continue;
    }
    
    // Check workload capacity
    if (!technician.canAcceptScheduledMaintenance()) {
      continue;
    }
    
    availableTechnicians.push(technician);
  }
  
  return availableTechnicians;
};

/* Export model */
const Technician = mongoose.model('Technician', technicianSchema, 'technicians');
module.exports = Technician;