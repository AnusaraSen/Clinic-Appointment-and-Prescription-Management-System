/**
 * Equipment Routes - Managing all our clinic equipment! 🏥
 * 
 * Enhanced routes with full CRUD operations and equipment management
 * capabilities to support the Equipment Status tab in the UI.
 */

const express = require('express');
const { 
  getAllEquipment,
  getEquipmentStats,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment
} = require('../controllers/EquipmentController');

// Import middleware
const { 
  validation, 
  queryProcessing, 
  responseFormatting
} = require('../../../middleware');

const router = express.Router();

// Apply response formatting middleware to all routes
router.use(responseFormatting.formatSuccessResponse());
router.use(responseFormatting.formatErrorResponse());
router.use(responseFormatting.addPaginationMeta());

/**
 * Equipment Statistics Route
 * GET /api/equipment/stats - Get equipment statistics for dashboard
 */
router.get('/stats', 
  responseFormatting.asyncHandler(getEquipmentStats)
);

/**
 * List All Equipment
 * GET /api/equipment - Get all equipment with filtering and pagination
 * Query params: status, type, location, isCritical, page, limit
 */
router.get('/', 
  queryProcessing.parseFilters(['status', 'type', 'location', 'isCritical']),
  queryProcessing.parsePagination({ defaultLimit: 50, maxLimit: 100 }),
  queryProcessing.parseSort({ defaultSort: 'name', allowedFields: ['name', 'equipment_id', 'status', 'type', 'location'] }),
  responseFormatting.asyncHandler(getAllEquipment)
);

/**
 * Get Single Equipment
 * GET /api/equipment/:id - Get specific equipment details
 */
router.get('/:id', 
  validation.validateObjectId(),
  responseFormatting.asyncHandler(getEquipmentById)
);

/**
 * Create New Equipment
 * POST /api/equipment - Add new equipment to the system
 */
router.post('/', 
  validation.validateEquipmentCreate(),
  responseFormatting.asyncHandler(createEquipment)
);

/**
 * Update Equipment Status
 * PUT /api/equipment/:id/status - Update equipment status specifically
 * This is used for automatic status updates from maintenance requests
 */
router.put('/:id/status',
  validation.validateObjectId(),
  validation.validateEquipmentStatusUpdate(),
  responseFormatting.asyncHandler(updateEquipmentStatus)
);

/**
 * Update Equipment
 * PUT /api/equipment/:id - Update equipment details
 */
router.put('/:id', 
  validation.validateObjectId(),
  validation.validateEquipmentUpdate(),
  responseFormatting.asyncHandler(updateEquipment)
);

/**
 * Delete Equipment
 * DELETE /api/equipment/:id - Remove equipment from system
 */
router.delete('/:id', 
  validation.validateObjectId(),
  responseFormatting.asyncHandler(deleteEquipment)
);

module.exports = router;
