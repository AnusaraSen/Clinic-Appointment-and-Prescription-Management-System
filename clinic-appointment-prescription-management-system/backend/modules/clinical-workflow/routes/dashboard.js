const express = require('express');
const router = express.Router();
// Use the correct patient model file (Medical_Records.js) instead of a non-existent Patient.js
const Patient = require('../models/Medical_Records');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointment_date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Patients seen today
    const patientsSeen = await Appointment.countDocuments({
      appointment_date: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'completed'
    });

    // Pending follow-ups
    const pendingFollowUps = await Task.countDocuments({
      type: 'follow_up',
      status: 'pending'
    });

    // Prescriptions issued (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const prescriptionsIssued = await Prescription.countDocuments({
      Date: { $gte: weekAgo }
    });

    // Calculate daily target percentage for patients seen
    const dailyTarget = 5; // Assuming target of 5 patients per day
    const targetPercentage = Math.round((patientsSeen / dailyTarget) * 100);

    res.json({
      todayAppointments,
      patientsSeen,
      pendingFollowUps,
      prescriptionsIssued,
      targetPercentage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's appointments
router.get('/appointments/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      appointment_date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ appointment_time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get urgent tasks
router.get('/tasks/urgent', async (req, res) => {
  try {
    const tasks = await Task.find({
      status: 'pending',
      $or: [
        { priority: 'urgent' },
        { due_date: { $lte: new Date() } }
      ]
    }).sort({ due_date: 1 }).limit(10);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activities
router.get('/activities/recent', async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ created_at: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Create activity record
    await Activity.create({
      type: 'appointment',
      description: `Appointment ${status} with ${appointment.patient_name}`,
      patient_id: appointment.patient_id,
      patient_name: appointment.patient_name
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark task as completed
router.patch('/tasks/:id/complete', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;