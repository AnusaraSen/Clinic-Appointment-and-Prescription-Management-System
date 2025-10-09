const express = require('express');
const router = express.Router();

const {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  lowStock,
} = require('../controllers/OrderControllers');

// Order management endpoints
router.get('/', listOrders);
router.get('/low-stock', lowStock);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
