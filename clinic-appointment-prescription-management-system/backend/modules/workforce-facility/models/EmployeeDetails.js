const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User collection
  role: { type: String, enum: ['doctor', 'pharmacist', 'lab_assistant', 'admin', 'nurse', 'other'], required: true },
  department: String,
  start_date: Date,
  end_date: Date,
  base_working_hours: String, // e.g., "9:00-17:00"
  modified_hours_requests: [
    {
      date: Date,
      requested_hours: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }
  ],
  status: { type: String, enum: ['active', 'terminated', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
