const express = require('express');
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/ExternalCompanyController');

/**
 * External Companies Routes
 * Base path: /api/external-companies
 *
 * POST   /       -> create a company
 * GET    /       -> list companies
 * GET    /:id    -> get single company
 * PUT    /:id    -> update company
 * DELETE /:id    -> remove company
 */
const router = express.Router();

router.post('/', createCompany);
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;



