const express = require('express');

const { getAllRequests, createRequest, assignRequest, updateRequest, deleteRequest} = require('../controllers/MaintenanceRequestController');

const router = express.Router();

// Placeholder routes for maintenance requests
router.get('/', getAllRequests);
router.post('/', createRequest);
router.put('/:id/assign', assignRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

module.exports = router;
