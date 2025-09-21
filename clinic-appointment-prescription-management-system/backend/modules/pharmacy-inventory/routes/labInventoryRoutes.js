const express = require('express');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getBasicSummary
} = require('../controllers/Lab_Inventory_Simple');

const router = express.Router();

// Add debug logging middleware for lab inventory routes
router.use((req, res, next) => {
  console.log('Lab inventory routes - Method:', req.method, 'Path:', req.path);
  next();
});

// Summary route (should come before other routes)
router.get('/summary/basic', getBasicSummary);

// Search route (should come before :id routes)
router.post('/search', searchItems);

// Basic CRUD routes
router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
