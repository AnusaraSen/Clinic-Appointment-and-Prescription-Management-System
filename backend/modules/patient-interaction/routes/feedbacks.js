const express = require("express");
const Feedback = require("../models/Feedbacks.js");
const Appointment = require("../models/Appointments.js");

const router = express.Router();

// Test route
//http://localhost:5000/feedback/test
router.get("/test", (_req, res) => {
  res.send("Feedback router works!");
});


// Add feedback
// http://localhost:5000/feedback/add
router.post("/add", async (req, res) => {
    const { appointment_id, rating, comments } = req.body;

    try {
        // Check if the appointment exists
    const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).json("Appointment not found");
        }

        const feedbackData = {
            appointment_id,
            rating,
            comments,
            patient_id: appointment.patient_id,
            patient_name: appointment.patient_name,
            doctor_id: appointment.doctor_id,
            doctor_name: appointment.doctor_name,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
        };
        const newFeedback = new Feedback(feedbackData);
        await newFeedback.save();
        res.json({ message: "Feedback added successfully", feedback: newFeedback });
    }

    catch (err) {
        res.status(400).json("Error: " + err.message);
    }
});

// Get feedback by appointment id (at most one expected per appointment)
// GET /feedback/by-appointment/:appointmentId
router.get('/by-appointment/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const d = await Feedback.findOne({ appointment_id: appointmentId }).populate('appointment_id');
        if (!d) return res.status(404).json({ message: 'No feedback for appointment' });
        const o = d.toObject ? d.toObject() : d;
        const appt = o.appointment_id && typeof o.appointment_id === 'object' ? o.appointment_id : null;
        const payload = {
          ...o,
          appointment_id: appt?._id?.toString?.() || String(o.appointment_id),
          appointment: appt ? {
            _id: appt._id?.toString?.() || String(appt._id || ''),
            patient_id: appt.patient_id,
            patient_name: appt.patient_name,
            doctor_id: appt.doctor_id,
            doctor_name: appt.doctor_name,
            appointment_date: appt.appointment_date,
            appointment_time: appt.appointment_time
          } : null
        };
        res.json({ feedback: payload });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// Upsert feedback by appointment id: create if not exists, else update
// PUT /feedback/upsert
router.put('/upsert', async (req, res) => {
    try {
        const { appointment_id, rating, comments } = req.body;
        if (!appointment_id) return res.status(400).json({ message: 'appointment_id required' });
        const appt = await Appointment.findById(appointment_id);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });
                const update = {
                    appointment_id,
                    rating,
                    comments,
                    patient_id: appt.patient_id,
                    patient_name: appt.patient_name,
                    doctor_id: appt.doctor_id,
                    doctor_name: appt.doctor_name,
                    appointment_date: appt.appointment_date,
                    appointment_time: appt.appointment_time,
                };
            let doc = await Feedback.findOneAndUpdate(
            { appointment_id },
            { $set: update },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
            // normalize appointment_id to string in response
            const serialized = doc.toObject ? doc.toObject() : doc;
            serialized.appointment_id = serialized.appointment_id?.toString?.() || String(serialized.appointment_id);
            res.json({ message: 'Feedback saved', feedback: serialized });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// Get all feedback
// http://localhost:5000/feedback/
router.get("/", async (_req, res) => {
        try {
                const docs = await Feedback.find().populate("appointment_id");
                const enriched = docs.map(d => {
                    const o = d.toObject ? d.toObject() : d;
                    const appt = o.appointment_id && typeof o.appointment_id === 'object' ? o.appointment_id : null;
                    return {
                        ...o,
                        appointment_id: appt?._id?.toString?.() || String(o.appointment_id),
                        appointment: appt ? {
                            _id: appt._id?.toString?.() || String(appt._id || ''),
                            patient_id: appt.patient_id,
                            patient_name: appt.patient_name,
                            doctor_id: appt.doctor_id,
                            doctor_name: appt.doctor_name,
                            appointment_date: appt.appointment_date,
                            appointment_time: appt.appointment_time
                        } : null
                    };
                });
                res.json(enriched);
        } catch (err) {
                res.status(400).json("Error: " + err.message);
        }
});

// Get feedback by ID
// http://localhost:5000/feedback/get/:id
router.get("/get/:id", async (req, res) => {
    try {
        const d = await Feedback.findById(req.params.id).populate("appointment_id");
        if (!d) return res.status(404).json("Feedback not found");
        const o = d.toObject ? d.toObject() : d;
        const appt = o.appointment_id && typeof o.appointment_id === 'object' ? o.appointment_id : null;
        const payload = {
          ...o,
          appointment_id: appt?._id?.toString?.() || String(o.appointment_id),
          appointment: appt ? {
            _id: appt._id?.toString?.() || String(appt._id || ''),
            patient_id: appt.patient_id,
            patient_name: appt.patient_name,
            doctor_id: appt.doctor_id,
            doctor_name: appt.doctor_name,
            appointment_date: appt.appointment_date,
            appointment_time: appt.appointment_time
          } : null
        };
        res.status(200).json({ status: "Feedback fetched", feedback: payload });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update feedback
// http://localhost:5000/feedback/update/:id
router.put("/update/:id", async (req, res) => {
    try {
        const { appointment_id, rating, comments } = req.body;

        const feedbackData = { appointment_id, rating, comments };

        // If appointment_id is being updated, check if the new appointment exists
        if (appointment_id) {
            const appointment = await Appointment.findById(appointment_id);
            if (!appointment) {
                return res.status(404).json("Appointment not found");
            }
        }

        await Feedback.findByIdAndUpdate(req.params.id, feedbackData);
        res.status(200).json({ status: "Feedback updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  Delete feedback
router.delete("/delete/:id", async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: "Feedback deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
