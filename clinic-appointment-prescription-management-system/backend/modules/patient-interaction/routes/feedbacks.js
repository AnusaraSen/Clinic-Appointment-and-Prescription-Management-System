import express from "express";
import Feedback from "../models/Feedbacks.js";
import Appointment from "../models/Appointments.js";

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
    const feedbackData = { appointment_id, rating, comments };

    try {
        // Check if the appointment exists
        const appointment = await Appointment.findById(appointment_id);

        if (!appointment) {
            return res.status(404).json("Appointment not found");
        }

        const newFeedback = new Feedback(feedbackData);
        await newFeedback.save();
        res.json("Feedback added successfully");
    }

    catch (err) {
        res.status(400).json("Error: " + err.message);
    }
});

// Get all feedback
// http://localhost:5000/feedback/
router.get("/", async (_req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("appointment_id");
        res.json(feedbacks);
    } catch (err) {
        res.status(400).json("Error: " + err.message);
    }
});

// Get feedback by ID
// http://localhost:5000/feedback/get/:id
router.get("/get/:id", async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id).populate("appointment_id");
        if (!feedback) return res.status(404).json("Feedback not found");
        res.status(200).json({ status: "Feedback fetched", feedback });
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

export default router;
