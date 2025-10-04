const mongoose = require("mongoose");

// ================= LAB TEST SCHEMA =================
const labTestSchema = new mongoose.Schema(
  {
    labtest_id: { type: String, required: true, unique: true },

    // Patient reference
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

    // Doctor reference
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    // Type of lab test (Blood, Urine, X-Ray, etc.)
    type: { type: String, required: true },

    // Lab assistant reference
    labAssistant: { type: mongoose.Schema.Types.ObjectId, ref: "LabStaff" },

    // Current status
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },

    // Collection details
    collectedBy: { type: String },
    collectedDate: { type: Date },

    // Priority
    priorityLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    requestedBy: { type: String },

    // Results and notes
    results: { type: String },
    notes: { type: String },
    reportUrl: { type: String },

    // ✅ Equipments used - simple array for now
    equipments: [
      {
        name: { type: String },
        quantityUsed: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true, collection: "lab_tests" }
);

// Middleware to auto-update updatedAt
labTestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("LabTest", labTestSchema);
