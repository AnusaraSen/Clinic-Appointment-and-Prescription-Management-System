const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patient_name: {
    type: String,
    required: true
  },
  appointment_date: {
    type: Date,
    required: true
  },
  appointment_time: {
    type: String,
    required: true
  },
  appointment_type: {
    type: String,
    required: true,
    enum: ['Annual Checkup', 'Follow-up', 'Blood Test Results', 'Prescription Renewal', 'Consultation', 'Emergency']
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  notes: {
    type: String
  },
  doctor_name: {
    type: String,
    default: 'Dr. Alex Mitchell'
  },
  initials: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);