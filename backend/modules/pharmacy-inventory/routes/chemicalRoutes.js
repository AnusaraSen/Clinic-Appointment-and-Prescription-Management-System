const express = require('express');
const router = express.Router();
const {
  testRoute,
  getChemicals,
  getChemical,
  createChemical,
  updateChemical,
  deleteChemical,
  getChemicalSummary
} = require('../controllers/chemicalController');

// Test route
router.get('/test', testRoute);

// Summary route (must come before /:id route)
router.get('/summary/basic', getChemicalSummary);

// CRUD routes
router.route('/')
  .get(getChemicals)
  .post(createChemical);

router.route('/:id')
  .get(getChemical)
  .put(updateChemical)
  .delete(deleteChemical);

module.exports = router;
