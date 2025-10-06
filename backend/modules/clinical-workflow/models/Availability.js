const mongoose = require("mongoose");

// Availability now references the User model (role=Doctor) instead of a separate Doctor collection.
const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // changed from "Doctor"
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    description: { type: String, trim: true },
    deviationMinutes: { type: Number, default: 0 }, // +Early / -Delay / 0 On Time
    status: {
      type: String,
      enum: ["available", "unavailable", "booked"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to speed lookups for future slots per doctor per day
availabilitySchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model("Availability", availabilitySchema);
