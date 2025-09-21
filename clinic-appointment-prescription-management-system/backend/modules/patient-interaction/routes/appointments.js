const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointments.js"); // This will be PatientAppointment model
const Patient = require("../models/Patient.js"); // ensures model registered
const Doctor = require("../models/Doctor.js");

const router = express.Router();

// Debug: indicate router file loaded
console.log("[Router] Appointment router initialized");

// Temporary diagnostics endpoints
router.get("/_test", (_req, res) => {
  res.status(200).send("appointments router OK");
});

// quick health check — useful to debug network/DNS issues (does not hit DB)
router.get("/ping", (_req, res) => {
  res.status(200).send("pong");
});

// ✅ Add appointment
//http://localhost:5000/appointments/add
router.post("/add", async (req, res) => {
  const { patient_id, patient_name, doctor_id, doctor_name, doctor_specialty, appointment_date, appointment_time, appointment_type, status, reason, notes, follow_up } = req.body;

  const appointmentData = {
    patient_id,
    patient_name,
    doctor_id,
    doctor_name,
    doctor_specialty,
    appointment_date: appointment_date ? new Date(appointment_date) : undefined,
    appointment_time,
    appointment_type,
    status,
    reason,
    notes,
    follow_up: follow_up
      ? {
          date: follow_up.date ? new Date(follow_up.date) : undefined,
          time: follow_up.time,
        }
      : undefined,
  };

  try {
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();
    res.json("Appointment added successfully");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// ✅ Get all appointments
//http://localhost:5000/appointment/
router.get("/", async (_req, res) => {
  try {
    const docs = await Appointment.find()
      .populate({ path: "patient_id", select: "name avatar" })
      .populate({ path: "doctor_id", select: "name avatar specialty" });

    let normalized = docs.map((d) => {
      const o = d.toObject ? d.toObject() : d;
      const patient = o.patient_id && typeof o.patient_id === "object" ? o.patient_id : null;
      const doctor = o.doctor_id && typeof o.doctor_id === "object" ? o.doctor_id : null;
      return {
        ...o,
        patient, // full object for UI
        doctor,  // full object for UI
        patient_id: patient?._id?.toString?.() || (typeof o.patient_id === "string" ? o.patient_id : String(o.patient_id || "")),
        doctor_id: doctor?._id?.toString?.() || (typeof o.doctor_id === "string" ? o.doctor_id : String(o.doctor_id || "")),
      };
    });

    // Fallback: if doctor not populated but doctor_id looks like ObjectId, enrich it
    const missingDoctorIds = normalized
      .filter((a) => !a.doctor && a.doctor_id && mongoose.Types.ObjectId.isValid(a.doctor_id))
      .map((a) => new mongoose.Types.ObjectId(a.doctor_id));
    if (missingDoctorIds.length > 0) {
      const doctors = await Doctor.find({ _id: { $in: missingDoctorIds } }).select("name avatar specialty");
      const byId = new Map(doctors.map((d) => [String(d._id), d]));
      normalized = normalized.map((a) => {
        if (!a.doctor && byId.has(String(a.doctor_id))) {
          return { ...a, doctor: byId.get(String(a.doctor_id)) };
        }
        return a;
      });
    }

    res.json(normalized);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// ✅ Get appointment by ID
//http://localhost:5000/appointment/get/:id
router.get("/get/:id", async (req, res) => {
  try {
    let d = await Appointment.findById(req.params.id)
      .populate({ path: "patient_id", select: "name avatar" })
      .populate({ path: "doctor_id", select: "name avatar specialty" });

    if (!d) return res.status(404).json("Appointment not found");

    let o = d.toObject ? d.toObject() : d;
    const patient = o.patient_id && typeof o.patient_id === "object" ? o.patient_id : null;
    let doctor = o.doctor_id && typeof o.doctor_id === "object" ? o.doctor_id : null;

    // Fallback: populate doctor manually if missing but id is valid
    if (!doctor && o.doctor_id && typeof o.doctor_id !== "object" && mongoose.Types.ObjectId.isValid(o.doctor_id)) {
      const doc = await Doctor.findById(o.doctor_id).select("name avatar specialty");
      if (doc) doctor = doc.toObject ? doc.toObject() : doc;
    }

    const normalized = {
      ...o,
      patient,
      doctor,
      patient_id: patient?._id?.toString?.() || (typeof o.patient_id === "string" ? o.patient_id : String(o.patient_id || "")),
      doctor_id: doctor?._id?.toString?.() || (typeof o.doctor_id === "string" ? o.doctor_id : String(o.doctor_id || "")),
    };

    res.status(200).json({ status: "Appointment fetched", appointment: normalized });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get appointments by patient ID
// http://localhost:5000/appointment/by-patient/:id
router.get("/by-patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await Appointment.find({ patient_id: id })
      .populate({ path: "patient_id", select: "name avatar" })
      .populate({ path: "doctor_id", select: "name avatar specialty" })
      .sort({ date: 1, time: 1 });

    const normalized = docs.map((d) => {
      const o = d.toObject ? d.toObject() : d;
      const patient = o.patient_id && typeof o.patient_id === "object" ? o.patient_id : null;
      const doctor = o.doctor_id && typeof o.doctor_id === "object" ? o.doctor_id : null;
      return {
        ...o,
        patient,
        doctor,
        patient_id: patient?._id?.toString?.() || (typeof o.patient_id === "string" ? o.patient_id : String(o.patient_id || "")),
        doctor_id: doctor?._id?.toString?.() || (typeof o.doctor_id === "string" ? o.doctor_id : String(o.doctor_id || "")),
      };
    });

    res.json(normalized);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Update appointment
router.put("/update/:id", async (req, res) => {
  const { patient_id, patient_name, doctor_id, doctor_name, doctor_specialty, appointment_date, appointment_time, appointment_type, status, reason, notes, follow_up } = req.body;

  const updateData = {
    patient_id,
    patient_name,
    doctor_id,
    doctor_name,
    doctor_specialty,
    appointment_date: appointment_date ? new Date(appointment_date) : undefined,
    appointment_time,
    appointment_type,
    status,
    reason,
    notes,
    follow_up: follow_up
      ? {
          date: follow_up.date ? new Date(follow_up.date) : undefined,
          time: follow_up.time,
        }
      : undefined,
  };

  try {
    await Appointment.findByIdAndUpdate(req.params.id, updateData);
    res.status(200).json({ status: "Appointment updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete appointment
router.delete("/delete/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "Appointment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
