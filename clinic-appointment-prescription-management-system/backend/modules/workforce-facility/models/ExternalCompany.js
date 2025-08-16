const mongoose = require('mongoose');

const ExternalCompanySchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  contact_person: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String },
  service_type: { type: String, required: true },
  notes: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.ExternalCompany || mongoose.model('ExternalCompany', ExternalCompanySchema);


