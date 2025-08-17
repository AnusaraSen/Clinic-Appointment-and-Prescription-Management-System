const express = require('express');
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/ExternalCompanyController');

const router = express.Router();

// POST /api/external-companies
router.post('/', createCompany);

// GET /api/external-companies
router.get('/', getAllCompanies);

// GET /api/external-companies/:id
router.get('/:id', getCompanyById);

// PUT /api/external-companies/:id
router.put('/:id', updateCompany);

// DELETE /api/external-companies/:id
router.delete('/:id', deleteCompany);

module.exports = router;



