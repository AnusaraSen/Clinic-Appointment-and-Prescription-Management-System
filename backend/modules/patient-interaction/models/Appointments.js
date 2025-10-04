const mongoose = require("mongoose");


const appointmentSchema = new mongoose.Schema(
  {
    patient_id: {
      type: String, // Changed to String to accept non-ObjectId values like "200131002258"
      required: true,
    },
    patient_name: {
      type: String,
      required: true,
    },
    doctor_id: {
      type: String, // Changed to String to be more flexible
      required: false,
    },
    doctor_name: {
      type: String,
      required: true,
    },
    doctor_specialty: {
      type: String,
      required: false,
    },
    appointment_date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date(); // Ensure the date is not in the past
        },
        message: "Appointment date must be in the future.",
      },
    },
    appointment_time: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value); // Validate time format (HH:mm)
        },
        message: "Invalid time format. Use HH:mm.",
      },
    },
    appointment_type: {
      type: String,
      required: true,
      enum: ['Annual Checkup', 'Follow-up', 'Blood Test Results', 'Prescription Renewal', 'Consultation', 'Emergency'],
      default: 'Consultation'
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled", "Confirmed", "Rescheduled", "Cancelled", "Delayed"],
      default: "upcoming",
    },
    reason: {
      type: String,
      required: false,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    follow_up: {
      date: {
        type: Date,
        validate: {
          validator: function (value) {
            return !value || value >= new Date();
          },
          message: "Follow-up date must be in the future.",
        },
      },
      time: {
        type: String,
        validate: {
          validator: function (value) {
            return !value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
          },
          message: "Invalid follow-up time format. Use HH:mm.",
        },
      },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Virtual field to get a formatted date and time
appointmentSchema.virtual("formattedDateTime").get(function () {
  return `${this.date.toLocaleDateString()} ${this.time}`;
});

// Pre-save hook to log changes
appointmentSchema.pre("save", function (next) {
  console.log("Appointment is being saved:", this);
  next();
});

const Appointment = mongoose.models.PatientAppointment || mongoose.model("PatientAppointment", appointmentSchema, "PatientAppointments");

module.exports = Appointment;
