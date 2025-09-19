const express = require('express');
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
<<<<<<< Updated upstream
  searchMedicines
} = require('../controllers/Medicine_Inventory');

const router = express.Router();

// Add debug logging middleware for this route
router.use((req, res, next) => {
  console.log('Medicine routes - Method:', req.method, 'Path:', req.path);
  next();
});

// Search route (should come before :id routes)
router.get('/search', searchMedicines);

// Basic CRUD routes
router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.route('/:id')
  .get(getMedicineById)
  .put(updateMedicine)
  .delete(deleteMedicine);
=======
} = require('../controllers/medicineController');

const router = express.Router();

// Routes
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);
>>>>>>> Stashed changes

module.exports = router;
