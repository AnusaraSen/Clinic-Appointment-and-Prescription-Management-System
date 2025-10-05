const Joi = require('joi');

// Validation schemas
const createLabItemSchema = Joi.object({
  lab_item_id: Joi.string().required().trim(),
  itemName: Joi.string().required().trim().min(2).max(100),
  quantity: Joi.number().required().min(0),
  unit: Joi.string().required().trim().min(1).max(20),
  location: Joi.string().optional().trim().max(100),
  expiryDate: Joi.date().optional().greater('now').allow(null),
  inventory: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId validation
});

const updateLabItemSchema = Joi.object({
  lab_item_id: Joi.string().optional().trim(),
  itemName: Joi.string().optional().trim().min(2).max(100),
  quantity: Joi.number().optional().min(0),
  unit: Joi.string().optional().trim().min(1).max(20),
  location: Joi.string().optional().trim().max(100).allow(''),
  expiryDate: Joi.date().optional().greater('now').allow(null),
  inventory: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/)
});

const searchQuerySchema = Joi.object({
  search: Joi.string().optional().trim().min(1).max(100),
  category: Joi.string().optional().trim(),
  location: Joi.string().optional().trim(),
  lowStock: Joi.string().optional().valid('1', '0'),
  expired: Joi.string().optional().valid('1', '0'),
  expiringSoon: Joi.string().optional().valid('1', '0'),
  threshold: Joi.number().optional().min(1).max(1000),
  sortBy: Joi.string().optional().valid('itemName', 'quantity', 'expiryDate', 'createdAt'),
  sortOrder: Joi.string().optional().valid('asc', 'desc'),
  page: Joi.number().optional().min(1),
  limit: Joi.number().optional().min(1).max(100)
});

// Validation middleware
const validateCreateLabItem = (req, res, next) => {
  const { error, value } = createLabItemSchema.validate(req.body);
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

const validateUpdateLabItem = (req, res, next) => {
  const { error, value } = updateLabItemSchema.validate(req.body);
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
  validateCreateLabItem,
  validateUpdateLabItem,
  validateSearchQuery,
  validateObjectId
};
