const express = require('express');
const { 
  getAllRequests, 
  getRequestById,
  createRequest, 
  assignRequest, 
  updateRequest, 
  completeRequest,
  deleteRequest,
  getStats,
  exportFilteredMaintenanceRequests
} = require('../controllers/MaintenanceRequestController');

// Import reports controller
const {
  getReportMetrics,
  getStatusDistribution,
  getRequestsTrend
} = require('../controllers/ReportsController');

// Import middleware
const { 
  validation, 
  queryProcessing, 
  responseFormatting, 
  resourceValidation 
} = require('../../../middleware');

/**
 * Maintenance Request Routes
 * Base path: /api/maintenance-requests
 *
 * GET    /             -> list maintenance requests (with optional filters)
 * GET    /stats        -> get maintenance request statistics
 * GET    /:id          -> get single maintenance request by ID
 * POST   /             -> create new request
 * PUT    /:id/assign   -> assign to technician
 * PUT    /:id/complete -> mark request as completed
 * PUT    /:id          -> update request fields
 * DELETE /:id          -> delete request
 *
 * Updated to use middleware for validation, formatting, and resource checking
 */
const router = express.Router();

// Apply response formatting middleware to all routes
router.use(responseFormatting.formatSuccessResponse());
router.use(responseFormatting.formatErrorResponse());
router.use(responseFormatting.addPaginationMeta());

// Statistics route (must come before /:id to avoid conflict)
router.get('/stats', 
  responseFormatting.asyncHandler(getStats)
);

// ============= REPORTS ROUTES (must come before /:id) =============
// Get report metrics (KPIs)
router.get('/reports/metrics',
  responseFormatting.asyncHandler(getReportMetrics)
);

// Get status distribution
router.get('/reports/status-distribution',
  responseFormatting.asyncHandler(getStatusDistribution)
);

// Get requests trend (monthly)
router.get('/reports/trend',
  responseFormatting.asyncHandler(getRequestsTrend)
);

// Export filtered maintenance requests to Excel
router.post('/reports/export-filtered',
  responseFormatting.asyncHandler(exportFilteredMaintenanceRequests)
);
// ==================================================================

// List all maintenance requests with filtering, pagination, and sorting
router.get('/', 
  queryProcessing.parseFilters(['status', 'priority', 'assignedTo', 'reportedBy']),
  queryProcessing.parsePagination(20, 100),
  queryProcessing.parseSort({
    'created': 'createdAt',
    'updated': 'updatedAt', 
    'priority': 'priority',
    'status': 'status'
  }, '-createdAt'),
  queryProcessing.populateMaintenanceRequest,
  responseFormatting.asyncHandler(getAllRequests)
);

// Get single maintenance request
router.get('/:id', 
  validation.validateObjectId('id'),
  queryProcessing.populateMaintenanceRequest,
  responseFormatting.asyncHandler(getRequestById)
);

// Create new maintenance request
router.post('/', 
  validation.validateWithJoi(validation.maintenanceRequestSchemas.create),
  validation.validateObjectIdArray('equipment'),
  // resourceValidation.checkUserExists('reportedBy', 'body'), // Temporarily disabled for testing
  resourceValidation.checkEquipmentExists('equipment', 'body'),
  responseFormatting.asyncHandler(createRequest)
);

// Assign maintenance request to technician
router.put('/:id/assign',
  validation.validateObjectId('id'),
  validation.validateWithJoi(validation.maintenanceRequestSchemas.assign),
  resourceValidation.checkMaintenanceRequestExists('id', 'params'),
  resourceValidation.checkTechnicianExists('technicianId', 'body', true),
  responseFormatting.asyncHandler(assignRequest)
);

// Complete maintenance request
router.put('/:id/complete',
  validation.validateObjectId('id'),
  validation.validateWithJoi(validation.maintenanceRequestSchemas.complete),
  resourceValidation.checkMaintenanceRequestExists('id', 'params'),
  responseFormatting.asyncHandler(completeRequest)
);

// Update maintenance request
router.put('/:id',
  validation.validateObjectId('id'),
  validation.validateWithJoi(validation.maintenanceRequestSchemas.update),
  validation.validateObjectIdArray('equipment'),
  resourceValidation.checkMaintenanceRequestExists('id', 'params'),
  resourceValidation.checkEquipmentExists('equipment', 'body'),
  responseFormatting.asyncHandler(updateRequest)
);

// Delete maintenance request
router.delete('/:id',
  validation.validateObjectId('id'),
  resourceValidation.checkMaintenanceRequestExists('id', 'params'),
  responseFormatting.asyncHandler(deleteRequest)
);

module.exports = router;