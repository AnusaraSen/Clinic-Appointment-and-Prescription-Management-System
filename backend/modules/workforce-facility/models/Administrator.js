const mongoose = require('mongoose');

/**
 * Administrator Schema
 * Stores basic administrator information linked to User
 */
const administratorSchema = new mongoose.Schema({
  admin_id: {
    type: String,
    required: [true, 'Administrator ID is required'],
    uppercase: true,
    trim: true,
    match: [/^ADM-\d{4}$/, 'Administrator ID must match ADM-#### format']
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
    default: 'Administration'
  },
  role: {
    type: String,
    trim: true
  },
  accessLevel: {
    type: String,
    enum: ['full', 'limited', 'read-only'],
    default: 'limited'
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
administratorSchema.index({ admin_id: 1 }, { unique: true });
administratorSchema.index({ user: 1 }, { unique: true });
administratorSchema.index({ department: 1 });
administratorSchema.index({ accessLevel: 1 });
administratorSchema.index({ isActive: 1 });

/* Export model */
const Administrator = mongoose.model('Administrator', administratorSchema, 'administrators');
module.exports = Administrator;