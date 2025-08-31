const mongoose = require('mongoose');
const Joi = require('joi');

/**
 * Validation Middleware
 * Reusable validation functions for common patterns
 */

/**
 * Validates MongoDB ObjectId parameters
 * @param {string} paramName - Name of the parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
        data: null
      });
    }
    
    next();
  };
};

/**
 * Validates array of ObjectIds in request body
 * @param {string} fieldName - Name of the field containing ObjectId array
 */
const validateObjectIdArray = (fieldName) => {
  return (req, res, next) => {
    const ids = req.body[fieldName];
    
    if (ids && Array.isArray(ids)) {
      const allValid = ids.every(id => mongoose.isValidObjectId(id));
      if (!allValid) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${fieldName} - all items must be valid ObjectIds`,
          data: null
        });
      }
    }
    
    next();
  };
};

/**
 * Generic Joi validation middleware
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Where to validate ('body', 'query', 'params')
 */
const validateWithJoi = (schema, source = 'body') => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
        data: null
      });
    }

    // Replace the original data with validated/sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Maintenance Request validation schemas
 */
const maintenanceRequestSchemas = {
  create: Joi.object({
    title: Joi.string().trim().required().max(100),
    description: Joi.string().trim().required().max(1000),
    priority: Joi.string().valid('High', 'Medium', 'Low').default('Medium'),
    reportedBy: Joi.string().required(),
    date: Joi.date().optional(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    equipment: Joi.array().items(Joi.string()).optional(),
    cost: Joi.number().min(0).default(0)
  }),
  
  update: Joi.object({
    title: Joi.string().trim().max(100).optional(),
    description: Joi.string().trim().max(1000).optional(),
    status: Joi.string().valid('Open', 'In Progress', 'Completed', 'Cancelled').optional(),
    priority: Joi.string().valid('High', 'Medium', 'Low').optional(),
    date: Joi.date().optional(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    equipment: Joi.array().items(Joi.string()).optional(),
    cost: Joi.number().min(0).optional()
  }).min(1),

  assign: Joi.object({
    technicianId: Joi.string().required()
  }),

  complete: Joi.object({
    cost: Joi.number().min(0).optional(),
    notes: Joi.string().trim().max(1000).optional()
  })
};

module.exports = {
  validateObjectId,
  validateObjectIdArray,
  validateWithJoi,
  maintenanceRequestSchemas
};
