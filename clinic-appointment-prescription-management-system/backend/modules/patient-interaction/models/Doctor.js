import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String },
    specialty: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");
export default Doctor;
