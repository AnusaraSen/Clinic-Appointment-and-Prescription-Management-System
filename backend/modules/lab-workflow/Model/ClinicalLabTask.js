const mongoose = require("mongoose");

const clinicalLabTaskSchema = new mongoose.Schema({
  task_id: { type: String, required: true, unique: true },
  taskTitle: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Sample Collected", "In Progress", "Results Ready", "Completed", "Cancelled"], 
    default: "Pending" 
  },
  createdAt: { type: Date, default: Date.now },
  taskDescription: { type: String },
  
  // Assignment fields
  labAssistant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "LabStaff",
    set: function(value) {
      if (!value || mongoose.Types.ObjectId.isValid(value)) {
        return value;
      }
      this._labAssistantString = value;
      return undefined;
    }
  },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  ordering_physician: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ["Routine", "Urgent", "STAT", "Critical"], 
    default: "Routine" 
  },
  dueDate: { type: Date },
  updatedAt: { type: Date, default: Date.now },

  // Clinical Test Information
  testInformation: {
    testType: { 
      type: String, 
      required: true,
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
        "Pathology",
        "Other"
      ]
    },
    testCode: { type: String, required: true }, // CPT/LOINC codes
    clinicalIndication: { type: String, required: true },
    specimenType: { 
      type: String, 
      required: true,
      enum: ["Blood", "Urine", "Serum", "Plasma", "CSF", "Tissue", "Swab", "Sputum", "Stool", "Other"]
    },
    collectionMethod: { type: String },
    fastingRequired: { type: Boolean, default: false },
    specialInstructions: { type: String }
  },

  // Sample Collection
  sampleCollection: {
    collectedBy: { type: String },
    collectionDateTime: { type: Date },
    collectionSite: { type: String },
    tubeType: { type: String },
    volume: { type: String },
    labelsApplied: { type: Boolean, default: false },
    notes: { type: String }
  },

  // Test Processing
  processing: {
    receivedDateTime: { type: Date },
    processedBy: { type: String },
    instrumentUsed: { type: String },
    methodUsed: { type: String },
    chemicalUsed: { type: String }, // New field for chemical used in processing
    calibrationStatus: { type: String },
    qualityControlPassed: { type: Boolean },
    processingNotes: { type: String },
    technicalIssues: { type: String }
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
      },
      interpretation: { type: String }
    }],
    overallInterpretation: { type: String },
    clinicalSignificance: { type: String },
    recommendations: { type: String },
    criticalValues: { type: Boolean, default: false },
    physicianNotified: { type: Boolean, default: false },
    notificationTime: { type: Date }
  },

  // Quality Assurance
  qualityControl: {
    controlSampleResults: { type: String },
    calibrationCheck: { type: Boolean, default: false },
    instrumentMaintenance: { type: Boolean, default: false },
    reviewedBy: { type: String },
    reviewDateTime: { type: Date },
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
  }],

  // Report Generation
  report: {
    reportGenerated: { type: Boolean, default: false },
    reportDateTime: { type: Date },
    reportFormat: { type: String, default: "PDF" },
    sentToPhysician: { type: Boolean, default: false },
    sentToPatient: { type: Boolean, default: false },
    deliveryMethod: { type: String }
  }

}, { collection: 'clinical_lab_tasks' });

// Middleware to resolve lab assistant ID before validation
clinicalLabTaskSchema.pre("validate", async function (next) {
  if (this._labAssistantString) {
    try {
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

// Middleware for findOneAndUpdate
clinicalLabTaskSchema.pre("findOneAndUpdate", async function(next) {
  const update = this.getUpdate();
  
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

module.exports = mongoose.model("ClinicalLabTask", clinicalLabTaskSchema);