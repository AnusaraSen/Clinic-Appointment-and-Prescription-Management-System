const express = require('express');
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getMedicineByName,
  dispenseByName,
  dispenseBulk
} = require('../controllers/Medicine_Inventory');

const router = express.Router();

// Debug logging middleware (retain for now; remove later if noisy)
router.use((req, res, next) => {
  console.log('[MedicineRoutes]', req.method, req.originalUrl);
  next();
});

// Search route (place before parameterized :id routes)
router.get('/search', searchMedicines);
// Lookup by name
router.get('/by-name', getMedicineByName);
// Dispense endpoints
router.post('/dispense-by-name', dispenseByName);
router.post('/dispense-bulk', dispenseBulk);

// Collection routes
router.route('/')
  .get(getMedicines)
  .post(createMedicine);

// Item routes
router.route('/:id')
  .get(getMedicineById)
  .put(updateMedicine)
  .delete(deleteMedicine);

module.exports = router;
