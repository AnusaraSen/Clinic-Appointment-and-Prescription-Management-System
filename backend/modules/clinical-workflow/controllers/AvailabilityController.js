const Availability = require("../models/Availability");
const mongoose = require("mongoose");

// Availability now references User (role=Doctor) via doctorId.
// Seed example (see scripts/seedDoctorAvailability.js):
// POST /api/availability { doctorId, date, startTime, endTime, deviationMinutes }

// @desc    Get availability for a doctor (User id)
// @route   GET /api/availability/doctor/:doctorId
exports.getDoctorAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ doctorId: req.params.doctorId });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add availability (doctorId should be a User's _id with role=Doctor)
// @route   POST /api/availability
exports.addAvailability = async (req, res) => {
  console.log("Add availability request:", req.body);
  const { doctorId, date, startTime, endTime, description, deviationMinutes } = req.body;

  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId ObjectId" });
    }

    const newAvailability = new Availability({
      doctorId,
      date,
      startTime,
      endTime,
      description,
      deviationMinutes: deviationMinutes ?? 0,
    });

    const saved = await newAvailability.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving availability:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update availability
// @route   PUT /api/availability/:id
exports.updateAvailability = async (req, res) => {
  try {
    const allowed = ['date','startTime','endTime','description','deviationMinutes','status'];
    const body = {};
    allowed.forEach(k=> { if (req.body[k] !== undefined) body[k] = req.body[k]; });
    const updated = await Availability.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
exports.deleteAvailability = async (req, res) => {
  try {
    const deleted = await Availability.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Availability deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all availability
// @route   GET /api/availability
exports.listAllAvailability = async (req, res) => {
  try {
    const docs = await Availability.find({}).limit(500).lean();
    res.json({ count: docs.length, items: docs.map(d => ({ id: d._id, doctorId: d.doctorId, date: d.date, startTime: d.startTime, endTime: d.endTime, deviationMinutes: d.deviationMinutes })) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
