
const mongoose = require('mongoose');

const UtilitiesPaymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['Electricity', 'Water', 'Other'], required: true },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Installment'], required: true },
  due_date: { type: Date, required: true }
});

const MaintenanceRequestSchema = new mongoose.Schema({
  description: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: false },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  appointment_date: { type: Date },
  completion_notes: { type: String },
  cost: { type: Number, min: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt:  'updated_at' }
});

module.exports = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);
