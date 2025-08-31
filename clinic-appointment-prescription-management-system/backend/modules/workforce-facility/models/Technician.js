const mongoose = require('mongoose');

/**
 * Technician Schema
 * - Adds basic validation, timestamps, virtuals, indexes and exports the model.
 */
const technicianSchema = new mongoose.Schema({
  technician_id: {
    type: String,
    required: [true, 'Technician ID is required'],
    uppercase: true,
    trim: true,
    match: [/^TECH-\d{4}$/, 'Technician ID must match TECH-XXXX']
    // Note: Removed unique: true here since we define it in schema.index() below
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: 100
  },
  specialization: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number']
  },
  startDate: { type: Date },
  endDate: { type: Date, default: null },
  availability: { type: Boolean, default: true },
  assignedRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }],
  maxConcurrentRequests: { type: Number, default: 5, min: 1 }
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
  return !this.endDate || this.endDate > new Date();
});

/* Instance methods */
technicianSchema.methods.canAcceptNewRequest = function() {
  const assigned = Array.isArray(this.assignedRequests) ? this.assignedRequests.length : 0;
  return this.availability && assigned < (this.maxConcurrentRequests || 5) && this.isCurrentlyEmployed;
};

/* Indexes */
technicianSchema.index({ technician_id: 1 }, { unique: true });
technicianSchema.index({ user: 1 });
technicianSchema.index({ specialization: 1, availability: 1 });

/* Export model */
const Technician = mongoose.model('Technician', technicianSchema, 'technicians');
module.exports = Technician;