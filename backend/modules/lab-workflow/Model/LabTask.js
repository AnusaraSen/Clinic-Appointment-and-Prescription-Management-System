const mongoose = require("mongoose");

const labTaskSchema = new mongoose.Schema({
  task_id: { type: String, required: true, unique: true },
  taskTitle: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Sample Collected", "In Progress", "Results Ready", "Completed", "Cancelled"], 
    default: "Pending" 
  },
  createdAt: { type: Date, default: Date.now },
  taskDescription: { type: String },
  labAssistant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "LabStaff",
    set: function(value) {
      // If it's already an ObjectId or null/undefined, return as-is
      if (!value || mongoose.Types.ObjectId.isValid(value)) {
        return value;
      }
      
      // Store the string value temporarily for async resolution
      this._labAssistantString = value;
      return undefined; // Will be resolved in pre-validate hook
    }
  },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  priority: { 
    type: String, 
    enum: ["High", "Medium", "Low", "Routine", "Urgent", "STAT", "Critical"], 
    default: "Medium" 
  },
  dueDate: { type: Date },
  updatedAt: { type: Date, default: Date.now },
  
  // Clinical Test Information
  testInformation: {
    testType: { 
      type: String, 
      enum: [
        "Complete Blood Count (CBC)",
        "Basic Metabolic Panel (BMP)", 
        "Comprehensive Metabolic Panel (CMP)",
        "Lipid Panel",
        "Liver Function Tests",
        "Kidney Function Tests",
        "Thyroid Function Tests",
        "Urinalysis",
        "Blood Glucose",
        "HbA1c",
        "Cardiac Markers",
        "Inflammatory Markers",
        "Coagulation Studies",
        "Blood Culture",
        "Urine Culture",
        "Microbiology",
        "Other"
      ]
    },
    clinicalIndication: { type: String },
    specimenType: { 
      type: String, 
      enum: ["Blood", "Urine", "Serum", "Plasma", "CSF", "Tissue", "Swab", "Sputum", "Stool", "Other"],
      default: "Blood"
    },
    collectionMethod: { type: String },
    fastingRequired: { type: Boolean, default: false },
    specialInstructions: { type: String }
  },

  // Sample Collection (Clinical Lab Workflow)
  sampleCollection: {
    collectedBy: { type: String },
    collectionDateTime: { type: Date },
    collectionSite: { type: String },
    tubeType: { type: String },
    volume: { type: String },
    labelsApplied: { type: Boolean, default: false },
    notes: { type: String }
  },

  // Test Processing (Clinical Lab)
  processing: {
    receivedDateTime: { type: Date },
    processedBy: { type: String },
    instrumentUsed: { type: String },
    methodUsed: { type: String },
    chemicalUsed: { type: String }, // New field for chemical used in processing
    qualityControlPassed: { type: Boolean },
    processingNotes: { type: String }
  },

  // Clinical Results
  results: {
    testResults: [{
      parameter: { type: String, required: true },
      value: { type: String, required: true },
      unit: { type: String },
      referenceRange: { type: String, required: true },
      abnormalFlag: { 
        type: String, 
        enum: ["", "H", "L", "Critical High", "Critical Low", "Abnormal"] 
      }
    }],
    overallInterpretation: { type: String },
    recommendations: { type: String },
    criticalValues: { type: Boolean, default: false },
    physicianNotified: { type: Boolean, default: false },
    reviewedBy: { type: String },
    approvedBy: { type: String },
    approvalDateTime: { type: Date }
  },

  // General notes for communication
  notes: [{
    content: { type: String, required: true },
    author: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["general", "clinical", "technical", "urgent", "result"], 
      default: "general" 
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, { collection: 'lab_tasks' });

// Middleware to resolve lab assistant ID before validation
labTaskSchema.pre("validate", async function (next) {
  // Handle labAssistant conversion from lab_staff_id to ObjectId
  if (this._labAssistantString) {
    try {
      // Try to find LabStaff by lab_staff_id
      const LabStaff = require("../../workforce-facility/models/LabStaff");
      const staff = await LabStaff.findOne({ lab_staff_id: this._labAssistantString });
      if (staff) {
        this.labAssistant = staff._id;
        delete this._labAssistantString;
      } else {
        const error = new Error(`Lab assistant not found with ID: ${this._labAssistantString}`);
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Middleware to resolve lab assistant ID before saving
labTaskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware for findOneAndUpdate operations
labTaskSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], async function (next) {
  const update = this.getUpdate();
  
  // Handle labAssistant in update operations
  if (update.labAssistant && typeof update.labAssistant === 'string') {
    if (!mongoose.Types.ObjectId.isValid(update.labAssistant)) {
      try {
        const LabStaff = require("../../workforce-facility/models/LabStaff");
        const staff = await LabStaff.findOne({ lab_staff_id: update.labAssistant });
        if (staff) {
          update.labAssistant = staff._id;
        } else {
          const error = new Error(`Lab assistant not found with ID: ${update.labAssistant}`);
          return next(error);
        }
      } catch (error) {
        return next(error);
      }
    }
  }
  
  next();
});

// Clear any cached model to ensure schema changes take effect
if (mongoose.models.LabTask) {
  delete mongoose.models.LabTask;
}

module.exports = mongoose.model("LabTask", labTaskSchema);

