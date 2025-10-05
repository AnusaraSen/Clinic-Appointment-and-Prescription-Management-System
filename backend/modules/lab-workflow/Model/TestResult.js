const mongoose = require('mongoose');

const testParameterSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  referenceRange: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Critical', 'High', 'Low'],
    required: true
  },
  unit: {
    type: String,
    default: ''
  }
});

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  filePath: {
    type: String,
    required: true
  }
});

const testResultSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  labTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'In Progress', 'Verified'],
    default: 'Completed'
  },
  completedDate: {
    type: Date,
    required: true
  },
  requestedDate: {
    type: Date,
    required: true
  },
  
  // Patient Information
  patient: {
    name: {
      type: String,
      required: true
    },
    patientId: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    }
  },
  
  // Test Information
  requestedBy: {
    type: String,
    required: true
  },
  
  // Test Parameters and Results
  parameters: [testParameterSchema],
  
  // Lab Notes
  labNotes: {
    type: String,
    default: ''
  },
  
  // Staff Information
  performedBy: {
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'Lab Assistant'
    }
  },
  verifiedBy: {
    name: {
      type: String,
      required: false
    },
    role: {
      type: String,
      default: 'Lab Technician'
    }
  },
  
  // Attachments
  attachments: [attachmentSchema],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
testResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
testResultSchema.index({ labTestId: 1 });
testResultSchema.index({ 'patient.patientId': 1 });
testResultSchema.index({ completedDate: -1 });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;