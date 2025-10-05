const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  deviationMinutes: {
    // Positive = Early, Negative = Delay, 0 = On Time
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["available", "unavailable", "booked"],
    default: "available",
  },
});

module.exports = mongoose.model("Availability", availabilitySchema);
