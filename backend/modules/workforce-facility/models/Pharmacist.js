const mongoose = require('mongoose');

/**
 * Pharmacist Schema
 * Stores basic pharmacist information linked to User
 */
const pharmacistSchema = new mongoose.Schema({
  pharmacist_id: {
    type: String,
    required: [true, 'Pharmacist ID is required'],
    uppercase: true,
    trim: true,
    match: [/^PHA-\d{4}$/, 'Pharmacist ID must match PHA-#### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Professional Information
  licenseNumber: {
    type: String,
    trim: true
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
pharmacistSchema.index({ pharmacist_id: 1 }, { unique: true });
pharmacistSchema.index({ user: 1 }, { unique: true });
pharmacistSchema.index({ shift: 1 });
pharmacistSchema.index({ isActive: 1 });

/* Export model */
const Pharmacist = mongoose.model('Pharmacist', pharmacistSchema, 'pharmacists');
module.exports = Pharmacist;