const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  // Foreign key to appointment (ObjectId)
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientAppointment",
    required: true,
  },

  // Rating and comments
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  comments: {
    type: String,
    maxlength: 1000,
  },

  // Snapshot fields for robust display (denormalized from Appointment at submit time)
  patient_id: { type: String },
  patient_name: { type: String },
  doctor_id: { type: String },
  doctor_name: { type: String },
  appointment_date: { type: Date },
  appointment_time: { type: String },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);