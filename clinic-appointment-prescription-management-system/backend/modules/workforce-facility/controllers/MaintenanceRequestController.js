const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/facilityDetails');

// GET /api/maintenance-requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate('requested_by')
      .populate('assigned_to')
      .sort({ created_at: -1 });
    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests', error: error.message });
  }
};

// POST /api/maintenance-requests
exports.createRequest = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, message: 'Request body must be JSON' });
    }

    const { description, location, priority, requested_by, appointment_date } = req.body;

    if (!description || !location || !requested_by) {
      return res.status(400).json({ success: false, message: 'description, location and requested_by are required' });
    }

    if (!mongoose.isValidObjectId(requested_by)) {
      return res.status(400).json({ success: false, message: 'requested_by must be a valid ObjectId' });
    }

    // Normalize priority to Schema enum if provided (High|Medium|Low)
    let normPriority = priority;
    if (typeof normPriority === 'string') {
      const cap = normPriority.charAt(0).toUpperCase() + normPriority.slice(1).toLowerCase();
      if (['High', 'Medium', 'Low'].includes(cap)) {
        normPriority = cap;
      } else {
        normPriority = undefined; // let schema default handle it
      }
    }

    const newRequest = await MaintenanceRequest.create({
      description,
      location,
      priority: normPriority,
      requested_by,
      appointment_date
    });

    return res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    const status = error?.name === 'ValidationError' || error?.name === 'CastError' ? 400 : 500;
    return res.status(status).json({ success: false, message: 'Failed to create maintenance request', error: error.message });
  }
};

// PUT /api/maintenance-requests/:id/assign
exports.assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_to_employee, assigned_to_company } = req.body || {};

    const target = assigned_to || assigned_to_employee || assigned_to_company;
    if (!target) {
      return res.status(400).json({ success: false, message: 'assigned_to is required' });
    }
    if (!mongoose.isValidObjectId(target)) {
      return res.status(400).json({ success: false, message: 'assigned_to must be a valid ObjectId' });
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id,
      { assigned_to: target },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    const status = error?.name === 'ValidationError' || error?.name === 'CastError' ? 400 : 500;
    return res.status(status).json({ success: false, message: 'Failed to assign maintenance request', error: error.message });
  }
};

// PUT /api/maintenance-requests/:id
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['status', 'completion_notes', 'cost', 'description', 'location', 'priority', 'appointment_date'];
    const update = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update maintenance request', error: error.message });
  }
};

// DELETE /api/maintenance-requests/:id
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MaintenanceRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }
    return res.json({ success: true, message: 'Maintenance request deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete maintenance request', error: error.message });
  }
};


