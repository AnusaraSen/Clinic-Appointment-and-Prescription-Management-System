const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, unique: true, trim: true }, // e.g., PT-12345
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", "Unknown"], default: "Unknown" },
    address: { type: String, trim: true },
    location: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    avatar: { type: String, trim: true }, // URL or base64 data URL
    medicalNotes: { type: String, trim: true },
    medicalFiles: [
      new mongoose.Schema(
        {
          originalName: { type: String, trim: true },
          filename: { type: String, trim: true },
          mimeType: { type: String, trim: true },
          size: { type: Number },
          url: { type: String, trim: true },
          uploadedAt: { type: Date, default: Date.now },
        },
        { _id: true }
      ),
    ],
  },
  { timestamps: true }
);

// Clean JSON output: add id alias but keep _id and __v to match existing docs
patientSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    return ret;
  },
});

// Note: patient_id index is already created by { unique: true } in schema definition
// patientSchema.index({ patient_id: 1 }, { unique: true }); // Removed - duplicate index

const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
module.exports = Patient;
