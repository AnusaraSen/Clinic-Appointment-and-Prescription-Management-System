const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  // Prescription Identification
  prescriptionId: {
    type: String,
    required: [true, 'Prescription ID is required'],
    unique: true,
    uppercase: true
  },

  // Patient Information
  patient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    name: {
      type: String,
      required: [true, 'Patient name is required']
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative']
    },
    gender: {
      type: String,
      required: [true, 'Patient gender is required'],
      enum: ['Male', 'Female', 'Other']
    },
    phone: {
      type: String,
      required: [true, 'Patient phone is required']
    },
    email: {
      type: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      validUntil: Date
    }
  },

  // Prescribing Doctor Information
  prescribedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required']
    },
    licenseNumber: String,
    specialization: String,
    phone: String,
    department: String
  },

  // Medications
  medications: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required']
    },
    genericName: String,
    dosage: {
      type: String,
      required: [true, 'Dosage is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required']
    },
    duration: {
      type: String,
      required: [true, 'Duration is required']
    },
    quantityPrescribed: {
      type: Number,
      required: [true, 'Quantity prescribed is required'],
      min: [1, 'Quantity must be at least 1']
    },
    quantityDispensed: {
      type: Number,
      default: 0,
      min: [0, 'Quantity dispensed cannot be negative']
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required']
    },
    route: {
      type: String,
      enum: ['Oral', 'Topical', 'Injection', 'Inhaled', 'Other'],
      default: 'Oral'
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative']
    },
    substitutionAllowed: {
      type: Boolean,
      default: true
    },
    dispensedBy: {
      pharmacistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacist'
      },
      pharmacistName: String,
      dispensedAt: Date,
      batchNumber: String,
      expiryDate: Date
    }
  }],

  // Prescription Status and Workflow
  status: {
    type: String,
    enum: ['New', 'Pending', 'In Progress', 'Partially Dispensed', 'Dispensed', 'Completed', 'Cancelled', 'Expired'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Emergency'],
    default: 'Normal'
  },

  // Dates and Timeline
  dateIssued: {
    type: Date,
    required: [true, 'Date issued is required'],
    default: Date.now
  },
  dateExpiry: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  dateDispensed: Date,
  dateCompleted: Date,

  // Financial Information
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  insuranceCoverage: {
    type: Number,
    default: 0,
    min: [0, 'Insurance coverage cannot be negative']
  },
  patientPayment: {
    type: Number,
    default: 0,
    min: [0, 'Patient payment cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Insurance Pending'],
    default: 'Pending'
  },

  // Dispensing Information
  dispensingNotes: String,
  pharmacistNotes: String,
  drugInteractions: [String],
  allergies: [String],
  warnings: [String],

  // Refill Information
  refillsAllowed: {
    type: Number,
    default: 0,
    min: [0, 'Refills cannot be negative']
  },
  refillsRemaining: {
    type: Number,
    default: 0,
    min: [0, 'Refills remaining cannot be negative']
  },
  lastRefillDate: Date,

  // Compliance and Verification
  verifiedBy: {
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacist'
    },
    pharmacistName: String,
    verifiedAt: Date,
    verificationNotes: String
  },
  reviewedBy: {
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacist'
    },
    pharmacistName: String,
    reviewedAt: Date,
    reviewNotes: String
  },

  // Activity Log
  activityLog: [{
    action: {
      type: String,
      required: true,
      enum: [
        'Created',
        'Updated',
        'Verified',
        'Reviewed',
        'Dispensed',
        'Partially Dispensed',
        'Completed',
        'Cancelled',
        'Refilled',
        'Status Changed',
        'Payment Updated'
      ]
    },
    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      userName: {
        type: String,
        required: true
      },
      userRole: {
        type: String,
        required: true
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],

  // Additional Information
  diagnosisCode: String,
  diagnosisDescription: String,
  specialInstructions: String,
  cautionsAndWarnings: [String],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ 'patient.name': 1 });
prescriptionSchema.index({ 'prescribedBy.name': 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ priority: 1 });
prescriptionSchema.index({ dateIssued: -1 });
prescriptionSchema.index({ dateExpiry: 1 });
prescriptionSchema.index({ 'medications.medicineName': 1 });
prescriptionSchema.index({ createdAt: -1 });

// Virtual for days until expiry
prescriptionSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.dateExpiry) return null;
  const now = new Date();
  const expiry = new Date(this.dateExpiry);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for prescription age
prescriptionSchema.virtual('prescriptionAge').get(function() {
  const now = new Date();
  const issued = new Date(this.dateIssued);
  const diffTime = now - issued;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total medications count
prescriptionSchema.virtual('totalMedicationsCount').get(function() {
  return this.medications ? this.medications.length : 0;
});

// Virtual for dispensed medications count
prescriptionSchema.virtual('dispensedMedicationsCount').get(function() {
  if (!this.medications) return 0;
  return this.medications.filter(med => med.quantityDispensed > 0).length;
});

// Virtual for completion percentage
prescriptionSchema.virtual('completionPercentage').get(function() {
  if (!this.medications || this.medications.length === 0) return 0;
  
  const totalQuantity = this.medications.reduce((sum, med) => sum + med.quantityPrescribed, 0);
  const dispensedQuantity = this.medications.reduce((sum, med) => sum + med.quantityDispensed, 0);
  
  return totalQuantity > 0 ? Math.round((dispensedQuantity / totalQuantity) * 100) : 0;
});

// Pre-save middleware to generate prescription ID
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionId) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = today.toTimeString().slice(0, 8).replace(/:/g, '');
    this.prescriptionId = `P-${dateStr}${timeStr}`;
  }
  
  // Calculate total amount
  if (this.medications && this.medications.length > 0) {
    this.totalAmount = this.medications.reduce((sum, med) => {
      return sum + (med.totalPrice || med.unitPrice * med.quantityPrescribed || 0);
    }, 0);
  }
  
  // Calculate patient payment
  this.patientPayment = Math.max(0, this.totalAmount - this.insuranceCoverage);
  
  next();
});

// Method to add activity log entry
prescriptionSchema.methods.addActivityLog = function(action, performedBy, details, oldValue, newValue) {
  this.activityLog.push({
    action,
    performedBy,
    details,
    oldValue,
    newValue,
    timestamp: new Date()
  });
  
  // Keep only last 50 activity logs
  if (this.activityLog.length > 50) {
    this.activityLog = this.activityLog.slice(-50);
  }
};

// Method to dispense medication
prescriptionSchema.methods.dispenseMedication = function(medicationIndex, quantityDispensed, pharmacist, notes) {
  if (medicationIndex < 0 || medicationIndex >= this.medications.length) {
    throw new Error('Invalid medication index');
  }
  
  const medication = this.medications[medicationIndex];
  const remainingQuantity = medication.quantityPrescribed - medication.quantityDispensed;
  
  if (quantityDispensed > remainingQuantity) {
    throw new Error('Cannot dispense more than remaining quantity');
  }
  
  medication.quantityDispensed += quantityDispensed;
  medication.dispensedBy = {
    pharmacistId: pharmacist._id,
    pharmacistName: pharmacist.fullName,
    dispensedAt: new Date()
  };
  
  // Update prescription status based on dispensing progress
  if (this.completionPercentage === 100) {
    this.status = 'Dispensed';
    this.dateDispensed = new Date();
  } else if (this.completionPercentage > 0) {
    this.status = 'Partially Dispensed';
  }
  
  // Add activity log
  this.addActivityLog(
    'Dispensed',
    {
      userId: pharmacist._id,
      userName: pharmacist.fullName,
      userRole: pharmacist.role
    },
    `Dispensed ${quantityDispensed} units of ${medication.medicineName}. ${notes || ''}`,
    medication.quantityDispensed - quantityDispensed,
    medication.quantityDispensed
  );
};

// Method to update status
prescriptionSchema.methods.updateStatus = function(newStatus, performedBy, notes) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'Completed') {
    this.dateCompleted = new Date();
  }
  
  this.addActivityLog(
    'Status Changed',
    performedBy,
    notes || `Status changed from ${oldStatus} to ${newStatus}`,
    oldStatus,
    newStatus
  );
};

// Static method to get prescription statistics
prescriptionSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        dispensed: { $sum: { $cond: [{ $eq: ['$status', 'Dispensed'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'Expired'] }, 1, 0] } },
        emergency: { $sum: { $cond: [{ $eq: ['$priority', 'Emergency'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0, new: 0, pending: 0, inProgress: 0,
    dispensed: 0, completed: 0, cancelled: 0, expired: 0,
    emergency: 0, high: 0
  };
};

module.exports = mongoose.model('Prescription', prescriptionSchema);