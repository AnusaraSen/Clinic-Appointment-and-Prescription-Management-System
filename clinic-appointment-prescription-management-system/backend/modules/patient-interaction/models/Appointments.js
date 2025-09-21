import mongoose from "mongoose";


const appointmentSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // Reference to the Patient model
      required: true, // Made required for better data integrity
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // Reference to the Doctor model
      required: true, // Made required for better data integrity
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date(); // Ensure the date is not in the past
        },
        message: "Appointment date must be in the future.",
      },
    },
    time: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value); // Validate time format (HH:mm)
        },
        message: "Invalid time format. Use HH:mm.",
      },
    },
    status: {
      type: String,
      enum: ["Confirmed", "Rescheduled", "Cancelled", "Delayed"],
      default: "Confirmed",
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500, // Limit the reason length
    },
    follow_up: {
      date: {
        type: Date,
        validate: {
          validator: function (value) {
            return !value || value >= new Date(); // Ensure follow-up date is in the future
          },
          message: "Follow-up date must be in the future.",
        },
      },
      time: {
        type: String,
        validate: {
          validator: function (value) {
            return !value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value); // Validate time format
          },
          message: "Invalid follow-up time format. Use HH:mm.",
        },
      },
    },
    notes: {
      type: String,
      maxlength: 1000, // Optional field for additional notes
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

const Appointment = mongoose.model("Appointment", appointmentSchema, "Appointment");

export default Appointment;
