const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String },
    specialty: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema, "doctors");
module.exports = Doctor;
