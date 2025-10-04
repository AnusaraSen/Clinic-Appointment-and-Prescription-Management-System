const Joi = require('joi');

// Validation schemas
const createMedicineSchema = Joi.object({
  medicine_id: Joi.string().required().trim(),
  medicineName: Joi.string().required().trim().min(2).max(100),
  batchNumber: Joi.string().optional().trim().max(50),
  unit: Joi.string().required().trim().min(1).max(20),
  strength: Joi.string().optional().trim().max(50),
  genericName: Joi.string().optional().trim().max(100),
  expiryDate: Joi.date().optional().greater('now').allow(null),
  manufactureDate: Joi.date().optional().less('now').allow(null),
  dosageForm: Joi.string().optional().trim().max(50),
  inventory: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId validation
});

const updateMedicineSchema = Joi.object({
  medicine_id: Joi.string().optional().trim(),
  medicineName: Joi.string().optional().trim().min(2).max(100),
  batchNumber: Joi.string().optional().trim().max(50).allow(''),
  unit: Joi.string().optional().trim().min(1).max(20),
  strength: Joi.string().optional().trim().max(50).allow(''),
  genericName: Joi.string().optional().trim().max(100).allow(''),
  expiryDate: Joi.date().optional().greater('now').allow(null),
  manufactureDate: Joi.date().optional().less('now').allow(null),
  dosageForm: Joi.string().optional().trim().max(50).allow(''),
  inventory: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/)
});

const searchQuerySchema = Joi.object({
  search: Joi.string().optional().trim().min(1).max(100),
  genericName: Joi.string().optional().trim(),
  dosageForm: Joi.string().optional().trim(),
  strength: Joi.string().optional().trim(),
  batchNumber: Joi.string().optional().trim(),
  lowStock: Joi.string().optional().valid('1', '0'),
  expired: Joi.string().optional().valid('1', '0'),
  expiringSoon: Joi.string().optional().valid('1', '0'),
  threshold: Joi.number().optional().min(1).max(1000),
  sortBy: Joi.string().optional().valid('medicineName', 'expiryDate', 'manufactureDate', 'createdAt', 'strength'),
  sortOrder: Joi.string().optional().valid('asc', 'desc'),
  page: Joi.number().optional().min(1),
  limit: Joi.number().optional().min(1).max(100)
});

// Validation middleware
const validateCreateMedicine = (req, res, next) => {
  const { error, value } = createMedicineSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  req.validatedData = value;
  next();
};

const validateUpdateMedicine = (req, res, next) => {
  const { error, value } = updateMedicineSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  req.validatedData = value;
  next();
};

const validateSearchQuery = (req, res, next) => {
  const { error, value } = searchQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  req.validatedQuery = value;
  next();
};

// MongoDB ObjectId validation
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

module.exports = {
  validateCreateMedicine,
  validateUpdateMedicine,
  validateSearchQuery,
  validateObjectId
};
