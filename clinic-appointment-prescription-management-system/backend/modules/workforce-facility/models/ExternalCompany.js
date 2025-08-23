const mongoose = require('mongoose');

/**
 * External Company Schema
 * Represents third-party service providers (e.g., maintenance contractors, laboratory partners).
 */
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

// Re-use existing model if already compiled (prevents overwrite errors in watch mode / tests).
module.exports = mongoose.models.ExternalCompany || mongoose.model('ExternalCompany', ExternalCompanySchema);


