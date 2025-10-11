const mongoose = require('mongoose');

/**
 * LabStaff Schema
 * Stores basic lab staff information linked to User
 */
const labStaffSchema = new mongoose.Schema({
  lab_staff_id: {
    type: String,
    required: [true, 'Lab Staff ID is required'],
    uppercase: true,
    trim: true,
    match: [/^LAB-\d{4}$/, 'Lab Staff ID must match LAB-#### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Professional Information
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    default: 'Laboratory'
  },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: 'morning'
  },
  // Basic Contact Information
  extension: {
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
  },
  availability: {
    type: String,
    enum: ['Available', 'Not Available'],
    default: 'Available'
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
labStaffSchema.index({ lab_staff_id: 1 }, { unique: true });
labStaffSchema.index({ user: 1 }, { unique: true });
labStaffSchema.index({ position: 1 });
labStaffSchema.index({ shift: 1 });
labStaffSchema.index({ isActive: 1 });

/* Export model */
const LabStaff = mongoose.model('LabStaff', labStaffSchema, 'lab_staff');
module.exports = LabStaff;