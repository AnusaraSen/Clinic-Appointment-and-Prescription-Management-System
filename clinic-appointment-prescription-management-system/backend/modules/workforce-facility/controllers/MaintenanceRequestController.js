const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// GET /api/maintenance-requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate('requested_by')
      .populate('assigned_to_employee')
      .populate('assigned_to_company')
      .sort({ created_at: -1 });
    return res.json({ success: true, message: 'Fetched maintenance requests', data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests' });
  }
};

// POST /api/maintenance-requests
exports.createRequest = async (req, res) => {
  try {
    const { description, location, priority, requested_by, appointment_date } = req.body;

    if (!description || !location || !requested_by) {
      return res.status(400).json({ success: false, message: 'description, location and requested_by are required', data: null });
    }

    const newRequest = await MaintenanceRequest.create({
      description,
      location,
      priority,
      requested_by,
      appointment_date
    });

    return res.status(201).json({ success: true, message: 'Maintenance request created', data: newRequest });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create maintenance request', data: null });
  }
};

// PUT /api/maintenance-requests/:id/assign
exports.assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, companyId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid maintenance request id', data: null });
    }

    if ((!employeeId && !companyId) || (employeeId && companyId)) {
      return res.status(400).json({ success: false, message: 'Provide either employeeId or companyId (exclusively)', data: null });
    }

    const update = {};

    if (employeeId) {
      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid employeeId', data: null });
      }
      update.assigned_to_employee = employeeId;
      update.assigned_to_company = null;
    } else if (companyId) {
      if (!mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ success: false, message: 'Invalid companyId', data: null });
      }
      update.assigned_to_company = companyId;
      update.assigned_to_employee = null;
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(id, update, { new: true })
      .populate('assigned_to_employee')
      .populate('assigned_to_company');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found', data: null });
    }

    return res.json({ success: true, message: 'Maintenance request assigned', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to assign maintenance request', data: null });
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
      return res.status(404).json({ success: false, message: 'Maintenance request not found', data: null });
    }

    return res.json({ success: true, message: 'Maintenance request updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update maintenance request', data: null });
  }
};

// DELETE /api/maintenance-requests/:id
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MaintenanceRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found', data: null });
    }
    return res.json({ success: true, message: 'Maintenance request deleted', data: null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete maintenance request', data: null });
  }
};


