const Availability = require("../models/Availability");
const mongoose = require("mongoose");

// @desc    Get availability for a doctor
// @route   GET /api/availability/doctor/:doctorId
exports.getDoctorAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ doctorId: req.params.doctorId });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add availability
// @route   POST /api/availability
exports.addAvailability = async (req, res) => {
  console.log("Add availability request:", req.body);
  const { doctorId, date, startTime, endTime, description, deviationMinutes } = req.body;

  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // If doctorId is not a valid ObjectId, create a temporary one or use a string
    let validDoctorId;
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      validDoctorId = doctorId;
    } else {
      // For now, create a temporary ObjectId or use a default one
      validDoctorId = new mongoose.Types.ObjectId();
      console.log("Generated new ObjectId for doctor:", validDoctorId);
    }

    const newAvailability = new Availability({
      doctorId: validDoctorId,
      date,
      startTime,
      endTime,
      description,
      deviationMinutes: deviationMinutes ?? 0,
    });

    const saved = await newAvailability.save();
    console.log("Availability saved:", saved);
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
