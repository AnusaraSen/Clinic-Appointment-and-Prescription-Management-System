const express = require('express');
const router = express.Router();
const {
  testRoute,
  getEquipment,
  getSingleEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentSummary
} = require('../controllers/equipmentController');

// Test route
router.get('/test', testRoute);

// Summary route (must come before /:id route)
router.get('/summary/basic', getEquipmentSummary);

// CRUD routes
router.route('/')
  .get(getEquipment)
  .post(createEquipment);

router.route('/:id')
  .get(getSingleEquipment)
  .put(updateEquipment)
  .delete(deleteEquipment);

module.exports = router;
