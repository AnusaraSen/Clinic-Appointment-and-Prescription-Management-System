const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointments.js"); // This will be PatientAppointment model
const Patient = require("../models/Patient.js"); // ensures model registered
const Doctor = require("../models/Doctor.js");
const { verifyToken } = require("../../../middleware/authMiddleware.js");

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
  const { patient_id, patient_name, patient_nic, doctor_id, doctor_name, doctor_specialty, appointment_date, appointment_time, appointment_type, status, reason, notes, follow_up } = req.body;

  const appointmentData = {
    patient_id,
    patient_name,
    patient_nic,
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
  // Rebuild appointmentData preserving original logic
  const appointmentDateObj = appointment_date ? new Date(appointment_date) : undefined;
  const data = {
    patient_id,
    patient_name,
    patient_nic,
    doctor_id,
    doctor_name,
    doctor_specialty,
    appointment_date: appointmentDateObj,
    appointment_time,
    appointment_type,
    status,
    reason,
    notes,
    follow_up: follow_up ? { date: follow_up.date ? new Date(follow_up.date) : undefined, time: follow_up.time } : undefined,
  };

  try {
    if (!doctor_id || !appointmentDateObj || !appointment_time) {
      return res.status(400).json({ message: 'doctor_id, appointment_date and appointment_time are required' });
    }
    // Pre-conflict check (quick) - same doctor/date/time
    const startDay = new Date(appointmentDateObj); startDay.setHours(0,0,0,0);
    const endDay = new Date(startDay); endDay.setDate(endDay.getDate()+1);
    const existing = await Appointment.findOne({
      doctor_id: doctor_id,
      appointment_time: appointment_time,
      appointment_date: { $gte: startDay, $lt: endDay }
    }).select('_id');
    if (existing) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    const newAppointment = new Appointment(data);
    await newAppointment.save().catch(err => {
      // Handle race condition with unique index duplicate key
      if (err?.code === 11000) {
        throw Object.assign(new Error('Time slot already booked'), { statusCode: 409 });
      }
      throw err;
    });
  res.json({ message: 'Appointment added successfully', appointment_id: newAppointment._id, patient_nic: newAppointment.patient_nic });
  } catch (err) {
    const status = err.statusCode || (err.message.includes('duplicate key') ? 409 : 400);
    res.status(status).json({ error: err.message });
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
  const { patient_id, patient_name, patient_nic, doctor_id, doctor_name, doctor_specialty, appointment_date, appointment_time, appointment_type, status, reason, notes, follow_up } = req.body;

  const updateData = {
    patient_id,
    patient_name,
    patient_nic,
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

// Cancel appointment (doctor action) - sets status=Cancelled, records metadata
router.patch('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, actor } = req.body; // actor could be doctor user id or role
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    appt.status = 'Cancelled';
    appt.cancelled_by = actor || 'doctor';
    appt.cancelled_at = new Date();
    if (reason) appt.cancellation_reason = reason.slice(0,500);
    await appt.save();
    res.json({ message: 'Appointment cancelled', appointment: {
      _id: appt._id,
      status: appt.status,
      cancelled_by: appt.cancelled_by,
      cancelled_at: appt.cancelled_at,
      cancellation_reason: appt.cancellation_reason
    }});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Timing deviation: doctor sets early/late offset (minutes). Positive => late, Negative => early
router.patch('/timing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { offset_minutes } = req.body; // could be string
    if (offset_minutes === undefined || offset_minutes === null) return res.status(400).json({ message: 'offset_minutes required' });
    offset_minutes = Number(offset_minutes);
    if (Number.isNaN(offset_minutes)) return res.status(400).json({ message: 'offset_minutes must be a number' });
    // clamp to schema bounds
    if (offset_minutes > 720) offset_minutes = 720;
    if (offset_minutes < -720) offset_minutes = -720;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    // If already cancelled do not allow timing changes
    if (appt.status && appt.status.toLowerCase().startsWith('cancel')) {
      return res.status(409).json({ message: 'Cannot set timing on a cancelled appointment' });
    }
    appt.timing_offset_minutes = offset_minutes;
    appt.timing_status = offset_minutes === 0 ? 'on-time' : (offset_minutes < 0 ? 'early' : 'late');
    appt.timing_updated_at = new Date();
    await appt.save();
    res.json({
      message: 'Timing updated',
      appointment: {
        _id: appt._id,
        timing_offset_minutes: appt.timing_offset_minutes,
        timing_status: appt.timing_status,
        timing_updated_at: appt.timing_updated_at
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// List booked appointment times for a doctor (optionally filter by date=YYYY-MM-DD)
router.get('/booked/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // optional filter
    if (!doctorId) return res.status(400).json({ message: 'doctorId required' });
    const criteria = { doctor_id: doctorId };
    if (date) {
      const d = new Date(date + 'T00:00:00');
      const d2 = new Date(d); d2.setDate(d2.getDate()+1);
      criteria.appointment_date = { $gte: d, $lt: d2 };
    }
    const docs = await Appointment.find(criteria).select('appointment_date appointment_time doctor_id');
    res.json(docs.map(a => ({ id: a._id, date: a.appointment_date, time: a.appointment_time })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get appointments by doctor (supports ?date=YYYY-MM-DD or ?start=YYYY-MM-DD&end=YYYY-MM-DD)
router.get('/by-doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) return res.status(400).json({ message: 'doctorId required' });
    const { date, start, end } = req.query;
    const criteria = { doctor_id: doctorId };
    if (date) {
      const d = new Date(date + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        const d2 = new Date(d); d2.setDate(d2.getDate()+1);
        criteria.appointment_date = { $gte: d, $lt: d2 };
      }
    } else if (start && end) {
      const s = new Date(start + 'T00:00:00');
      const e = new Date(end + 'T00:00:00');
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const e2 = new Date(e); e2.setDate(e2.getDate()+1);
        criteria.appointment_date = { $gte: s, $lt: e2 };
      }
    }
    const docs = await Appointment.find(criteria).sort({ appointment_date: 1, appointment_time: 1 });
    res.json(docs.map(d => ({
      _id: d._id,
      appointment_date: d.appointment_date,
      appointment_time: d.appointment_time,
      appointment_type: d.appointment_type,
      status: d.status,
      patient_name: d.patient_name,
      patient_nic: d.patient_nic,
      doctor_id: d.doctor_id,
      timing_offset_minutes: d.timing_offset_minutes,
      timing_status: d.timing_status,
      timing_updated_at: d.timing_updated_at
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fallback: Get appointments by doctor name (exact or case-insensitive match)
// /appointments/by-doctor-name/:name?date=YYYY-MM-DD or ?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/by-doctor-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: 'name required' });
    const { date, start, end, loose } = req.query;
    let criteria = { doctor_name: loose ? new RegExp(name, 'i') : name };
    if (date) {
      const d = new Date(date + 'T00:00:00');
      if (!isNaN(d.getTime())) { const d2 = new Date(d); d2.setDate(d2.getDate()+1); criteria.appointment_date = { $gte: d, $lt: d2 }; }
    } else if (start && end) {
      const s = new Date(start + 'T00:00:00');
      const e = new Date(end + 'T00:00:00');
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) { const e2 = new Date(e); e2.setDate(e2.getDate()+1); criteria.appointment_date = { $gte: s, $lt: e2 }; }
    }
    const docs = await Appointment.find(criteria).sort({ appointment_date: 1, appointment_time: 1 });
    res.json(docs.map(d => ({
      _id: d._id,
      appointment_date: d.appointment_date,
      appointment_time: d.appointment_time,
      appointment_type: d.appointment_type,
      status: d.status,
      patient_name: d.patient_name,
      patient_nic: d.patient_nic,
      doctor_id: d.doctor_id,
      doctor_name: d.doctor_name,
      timing_offset_minutes: d.timing_offset_minutes,
      timing_status: d.timing_status,
      timing_updated_at: d.timing_updated_at
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Authenticated patient: get only their own appointments
// GET /appointments/my
router.get('/my', verifyToken, async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    // patient_id stored as string; some user models may use _id or a custom patientCode
    // Accept either exact match on user._id or user.patientId / patient_id field if present
    const possibleIds = new Set();
    if (user._id) possibleIds.add(String(user._id));
    if (user.patientId) possibleIds.add(String(user.patientId));
    if (user.patient_id) possibleIds.add(String(user.patient_id));
    if (possibleIds.size === 0) {
      return res.json([]); // no patient identifier => no appointments
    }
    const docs = await Appointment.find({ patient_id: { $in: Array.from(possibleIds) } })
      .sort({ appointment_date: 1, appointment_time: 1 });
    const sanitized = docs.map(d => ({
      _id: d._id,
      appointment_date: d.appointment_date,
      appointment_time: d.appointment_time,
      appointment_type: d.appointment_type,
      status: d.status,
      doctor_id: d.doctor_id,
      doctor_name: d.doctor_name,
      timing_offset_minutes: d.timing_offset_minutes,
      timing_status: d.timing_status,
      timing_updated_at: d.timing_updated_at,
      follow_up: d.follow_up,
      created_at: d.created_at
    }));
    res.json(sanitized);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
