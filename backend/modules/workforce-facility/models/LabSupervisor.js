const mongoose = require('mongoose');

/**
 * LabSupervisor Schema
 * Stores basic lab supervisor information linked to User
 */
const labSupervisorSchema = new mongoose.Schema({
  supervisor_id: {
    type: String,
    required: [true, 'Lab Supervisor ID is required'],
    uppercase: true,
    trim: true,
    match: [/^LSUP-\d{4}$/, 'Lab Supervisor ID must match LSUP-#### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Professional Information
  department: {
    type: String,
    trim: true,
    default: 'Laboratory'
  },
  managedSections: [{
    type: String,
    trim: true
  }],
  // Basic Contact Information
  officePhone: {
    type: String,
    trim: true
  },
  officeLocation: {
    type: String,
    trim: true
  },
  // Basic Notes
  notes: {
    type: String,
    trim: true,
    maxLength: 500
  },
  // Status Information
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
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

/* Indexes */
labSupervisorSchema.index({ supervisor_id: 1 }, { unique: true });
labSupervisorSchema.index({ user: 1 }, { unique: true });
labSupervisorSchema.index({ department: 1 });
labSupervisorSchema.index({ isActive: 1 });

/* Export model */
const LabSupervisor = mongoose.model('LabSupervisor', labSupervisorSchema, 'lab_supervisors');
module.exports = LabSupervisor;