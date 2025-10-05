const mongoose = require('mongoose');

/**
 * Patient Schema
 * Stores basic patient information linked to User
 */
const patientSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: [true, 'Patient ID is required'],
    uppercase: true,
    trim: true,
    match: [/^PAT-\d{4}$/, 'Patient ID must match PAT-#### format']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Information
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxLength: 100
    },
    relationship: {
      type: String,
      trim: true,
      maxLength: 50
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Invalid emergency contact phone number'
      }
    }
  },
  // Basic Notes
  notes: {
    type: String,
    trim: true,
    maxLength: 500
  },
  // Status Information
  registrationDate: {
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

/* Virtuals */
patientSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

/* Indexes */
patientSchema.index({ patient_id: 1 }, { unique: true });
patientSchema.index({ user: 1 }, { unique: true });
patientSchema.index({ isActive: 1 });
patientSchema.index({ registrationDate: 1 });

/* Export model */
const Patient = mongoose.model('Patient', patientSchema, 'patients');
module.exports = Patient;