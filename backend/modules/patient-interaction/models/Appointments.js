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
      // Custom validation moved to a schema-level pre('validate') hook below to allow time-aware logic.
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
    cancelled_by: {
      type: String, // 'doctor' | 'patient' | user id etc.
      required: false,
    },
    cancelled_at: {
      type: Date,
      required: false,
    },
    cancellation_reason: {
      type: String,
      maxlength: 500,
      required: false,
    },
    // Timing deviation fields: allow doctor to communicate being early or late
    // timing_offset_minutes: positive => late (minutes behind), negative => early (minutes ahead)
    timing_offset_minutes: {
      type: Number,
      required: false,
      default: 0,
      min: -720, // safety bounds (-12h .. +12h)
      max: 720,
    },
    timing_status: {
      type: String,
      required: false,
      enum: ['on-time', 'early', 'late'],
      default: 'on-time'
    },
    timing_updated_at: {
      type: Date,
      required: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Compound unique index for doctor, date, and time
appointmentSchema.index({ doctor_id: 1, appointment_date: 1, appointment_time: 1 }, { unique: true, sparse: true, name: 'uniq_doctor_datetime' });

// Virtual field to get a formatted date and time
appointmentSchema.virtual("formattedDateTime").get(function () {
  return `${this.date.toLocaleDateString()} ${this.time}`;
});

// Pre-validate hook to enforce full date+time future validation
appointmentSchema.pre('validate', function(next) {
  try {
    if (this.appointment_date && this.appointment_time) {
      // Build a Date object representing the intended start moment in local time
      const dateOnly = new Date(this.appointment_date); // already a Date stripped of time (00:00 local or UTC depending on driver)
      const [hh, mm] = this.appointment_time.split(':').map(n => parseInt(n, 10));
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
        return next(new Error('Invalid appointment_time format'));
      }
      // Clone to avoid mutating original
      const apptDateTime = new Date(dateOnly);
      apptDateTime.setHours(hh, mm, 0, 0);

      const now = new Date();
      if (apptDateTime <= now) {
        return next(new Error('Appointment date/time must be in the future.'));
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save hook to log changes (kept separate for clarity)
appointmentSchema.pre('save', function(next) {
  console.log('Appointment is being saved:', this.patient_id, this.appointment_date, this.appointment_time);
  next();
});

const Appointment = mongoose.models.PatientAppointment || mongoose.model("PatientAppointment", appointmentSchema, "PatientAppointments");

module.exports = Appointment;
