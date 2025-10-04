const mongoose = require('mongoose');

/**
 * Doctor Schema
 * Stores basic doctor information linked to User
 */
const doctorSchema = new mongoose.Schema({
  doctor_id: {
    type: String,
    required: [true, 'Doctor ID is required'],
    uppercase: true,
    trim: true,
    match: [/^DOC-\d{4}$/, 'Doctor ID must match DOC-#### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Professional Information
  specialty: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
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
doctorSchema.index({ doctor_id: 1 }, { unique: true });
doctorSchema.index({ user: 1 }, { unique: true });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ isActive: 1 });

/* Export model */
const Doctor = mongoose.model('Doctor', doctorSchema, 'doctors');
module.exports = Doctor;