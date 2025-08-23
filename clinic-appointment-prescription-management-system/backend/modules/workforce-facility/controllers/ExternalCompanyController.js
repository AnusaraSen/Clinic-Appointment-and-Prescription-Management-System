const mongoose = require('mongoose');
const Joi = require('joi');
const ExternalCompany = require('../models/ExternalCompany');

/**
 * Controller functions for External Company CRUD.
 * Each function returns JSON responses with appropriate HTTP status codes.
 * Validation is handled using Joi schemas (create & update).
 */

const createCompanySchema = Joi.object({
  company_name: Joi.string().trim().required(),
  contact_person: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  address: Joi.string().trim().allow('', null),
  service_type: Joi.string().trim().required(),
  notes: Joi.string().trim().allow('', null)
});

const updateCompanySchema = Joi.object({
  company_name: Joi.string().trim(),
  contact_person: Joi.string().trim(),
  phone: Joi.string().trim(),
  email: Joi.string().email().trim(),
  address: Joi.string().trim().allow('', null),
  service_type: Joi.string().trim(),
  notes: Joi.string().trim().allow('', null)
}).min(1);

/**
 * POST /api/external-companies
 * Create a new external company entry.
 */
async function createCompany(req, res) {
  try {
    const { value, error } = createCompanySchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message)
      });
    }

    const created = await ExternalCompany.create(value);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Failed to create external company:', err);
    return res.status(500).json({ message: 'Failed to create external company' });
  }
}

/**
 * GET /api/external-companies
 * List all external companies (newest first).
 */
async function getAllCompanies(req, res) {
  try {
    const companies = await ExternalCompany.find({}).sort({ created_at: -1 }).lean();
    return res.status(200).json(companies);
  } catch (err) {
    console.error('Failed to fetch external companies:', err);
    return res.status(500).json({ message: 'Failed to fetch external companies' });
  }
}

/**
 * GET /api/external-companies/:id
 * Retrieve a single company by its MongoDB ObjectId.
 */
async function getCompanyById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid company id' });
    }

    const company = await ExternalCompany.findById(id).lean();
    if (!company) {
      return res.status(404).json({ message: 'External company not found' });
    }

    return res.status(200).json(company);
  } catch (err) {
    console.error('Failed to fetch external company by id:', err);
    return res.status(500).json({ message: 'Failed to fetch external company' });
  }
}

/**
 * PUT /api/external-companies/:id
 * Update existing external company with validated fields.
 */
async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid company id' });
    }

    const { value, error } = updateCompanySchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message)
      });
    }

    const updated = await ExternalCompany.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: 'External company not found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error('Failed to update external company:', err);
    return res.status(500).json({ message: 'Failed to update external company' });
  }
}

/**
 * DELETE /api/external-companies/:id
 * Remove a company. Returns 204 No Content if successful.
 */
async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid company id' });
    }

    const deleted = await ExternalCompany.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'External company not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Failed to delete external company:', err);
    return res.status(500).json({ message: 'Failed to delete external company' });
  }
}

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};



