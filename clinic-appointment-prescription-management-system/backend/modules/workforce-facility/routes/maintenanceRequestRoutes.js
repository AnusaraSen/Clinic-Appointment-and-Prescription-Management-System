const express = require('express');
const { getAllRequests, createRequest, assignRequest, updateRequest, deleteRequest } = require('../controllers/MaintenanceRequestController');

/**
 * Maintenance Request Routes
 * Base path: /api/maintenance-requests
 *
 * GET    /             -> list maintenance requests
 * POST   /             -> create new request
 * PUT    /:id/assign   -> assign to employee OR company (exclusive)
 * PUT    /:id          -> update fields
 * DELETE /:id          -> delete request
 *
 * NOTE: The controller anticipates fields (assigned_to_employee / assigned_to_company) that are not
 * yet present in the current schema (which only has `assigned_to`). Align schema & controller soon.
 */
const router = express.Router();

router.get('/', getAllRequests);
router.post('/', createRequest);
router.put('/:id/assign', assignRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);

module.exports = router;
