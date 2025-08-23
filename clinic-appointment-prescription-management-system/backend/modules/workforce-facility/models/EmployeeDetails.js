const mongoose = require('mongoose');

/**
 * Employee Schema
 * Links to a User via user_id (assumes a User model exists).
 * Tracks employment lifecycle, role, department, and requested schedule modifications.
 */
const employeeSchema = new mongoose.Schema({
  /** Reference to the User document representing login / personal info */
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  /** Role used for authorization / UI */
  role: { type: String, enum: ['doctor', 'pharmacist', 'lab_assistant', 'admin', 'nurse', 'other'], required: true },
  /** Optional department grouping (e.g., Cardiology, Pharmacy) */
  department: String,
  /** Employment start date */
  start_date: Date,
  /** Optional end date if contract terminated */
  end_date: Date,
  /** Default working hours string (could be normalized later) */
  base_working_hours: String, // e.g., "09:00-17:00"
  /** Array of requested modifications to schedule with status tracking */
  modified_hours_requests: [
    {
      date: Date,
      requested_hours: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }
  ],
  /** Current employment status */
  status: { type: String, enum: ['active', 'terminated', 'inactive'], default: 'active' },
  /** Creation timestamp (redundant if using timestamps option; kept for backward compat) */
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
