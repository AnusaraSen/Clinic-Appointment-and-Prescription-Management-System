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
 * Authentication validation schemas
 */
const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(1)
  }),

  registerPatient: Joi.object({
    firstName: Joi.string().trim().required().min(2).max(50),
    lastName: Joi.string().trim().required().min(2).max(50),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(6)
      .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one letter, one number, and one special character'
      }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    address: Joi.object({
      street: Joi.string().trim().max(100).optional(),
      city: Joi.string().trim().max(50).optional(),
      state: Joi.string().trim().max(50).optional(),
      zipCode: Joi.string().trim().max(10).optional(),
      country: Joi.string().trim().max(50).optional()
    }).optional()
  }),

  registerStaff: Joi.object({
    firstName: Joi.string().trim().required().min(2).max(50),
    lastName: Joi.string().trim().required().min(2).max(50),
    email: Joi.string().email().required().trim().lowercase(),
    role: Joi.string().valid(
      'Doctor', 'Pharmacist', 'Technician', 'LabStaff', 
      'InventoryManager', 'LabSupervisor', 'Admin'
    ).required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    department: Joi.string().trim().max(100).optional(),
    specialization: Joi.string().trim().max(100).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6)
      .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one letter, one number, and one special character'
      })
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  })
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
    cost: Joi.number().min(0).optional(),
    costs: Joi.array().items(
      Joi.object({
        description: Joi.string().trim().max(200).required(),
        cost: Joi.number().min(0).required()
      })
    ).optional()
  }).min(1),

  assign: Joi.object({
    technicianId: Joi.string().required()
  }),

  complete: Joi.object({
    cost: Joi.number().min(0).optional(),
    notes: Joi.string().trim().max(1000).optional()
  })
};

/**
 * Equipment Validation Schemas
 */
const equipmentSchemas = {
  create: Joi.object({
    equipment_id: Joi.string()
      .pattern(/^EQ-\d{4}$/)
      .uppercase()
      .required()
      .messages({
        'string.pattern.base': 'Equipment ID must be in format EQ-1234',
        'any.required': 'Equipment ID is required'
      }),
    name: Joi.string()
      .trim()
      .max(100)
      .required()
      .messages({
        'string.max': 'Equipment name must be less than 100 characters',
        'any.required': 'Equipment name is required'
      }),
    location: Joi.string()
      .trim()
      .max(200)
      .required()
      .messages({
        'string.max': 'Location must be less than 200 characters',
        'any.required': 'Equipment location is required'
      }),
    type: Joi.string()
      .trim()
      .required()
      .messages({
        'any.required': 'Equipment type is required'
      }),
    status: Joi.string()
      .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair')
      .default('Operational'),
    isCritical: Joi.boolean().default(false),
    model: Joi.string().trim().optional(),
    serialNumber: Joi.string().trim().optional(),
    manufacturer: Joi.string().trim().optional(),
    purchaseDate: Joi.date().optional(),
    warrantyExpires: Joi.date().optional(),
    lastMaintenanceDate: Joi.date().optional(),
    nextScheduledMaintenance: Joi.date().optional(),
    downtimeHours: Joi.number().min(0).default(0),
    maintenanceInterval: Joi.number().min(1).max(365).optional()
  }),

  update: Joi.object({
    name: Joi.string().trim().max(100),
    location: Joi.string().trim().max(200),
    type: Joi.string().trim(),
    status: Joi.string()
      .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair'),
    isCritical: Joi.boolean(),
    model: Joi.string().trim(),
    modelNumber: Joi.string().trim(),
    serialNumber: Joi.string().trim(),
    manufacturer: Joi.string().trim(),
    purchaseDate: Joi.date(),
    warrantyExpires: Joi.date(),
    warrantyExpiry: Joi.date(),
    lastMaintenanceDate: Joi.date(),
    nextScheduledMaintenance: Joi.date(),
    downtimeHours: Joi.number().min(0),
    notes: Joi.string().trim().max(1000),
    maintenanceInterval: Joi.number().min(1).max(365).optional()
  }).min(1), // At least one field must be provided

  statusUpdate: Joi.object({
    status: Joi.string()
      .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair')
      .required(),
    downtimeStart: Joi.date().optional(),
    downtimeEnd: Joi.date().optional()
  })
};

/**
 * Equipment Validation Middleware Functions
 */
const validateEquipmentCreate = () => {
  return validateWithJoi(equipmentSchemas.create);
};

const validateEquipmentUpdate = () => {
  return validateWithJoi(equipmentSchemas.update);
};

const validateEquipmentStatusUpdate = () => {
  return validateWithJoi(equipmentSchemas.statusUpdate);
};

/**
 * Scheduled Maintenance validation schemas
 */
const scheduledMaintenanceSchemas = {
  create: Joi.object({
    equipment_id: Joi.string()
      .trim()
      .required()
      .pattern(/^EQ-\d+$/)
      .uppercase()
      .messages({
        'string.pattern.base': 'Equipment ID must be in format EQ-1234',
        'any.required': 'Equipment ID is required'
      }),
    title: Joi.string()
      .trim()
      .required()
      .max(100)
      .messages({
        'string.max': 'Title must be less than 100 characters',
        'any.required': 'Maintenance title is required'
      }),
    description: Joi.string()
      .trim()
      .optional()
      .max(500)
      .messages({
        'string.max': 'Description must be less than 500 characters'
      }),
    scheduled_date: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Scheduled date cannot be in the past',
        'any.required': 'Scheduled date is required'
      }),
    scheduled_time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .default('09:00')
      .messages({
        'string.pattern.base': 'Time must be in HH:MM format (24-hour)'
      }),
    maintenance_type: Joi.string()
      .valid('Preventive', 'Repair', 'Inspection', 'Calibration', 'Cleaning')
      .default('Preventive')
      .messages({
        'any.only': 'Maintenance type must be: Preventive, Repair, Inspection, Calibration, or Cleaning'
      }),
    priority: Joi.string()
      .valid('Critical', 'High', 'Medium', 'Low')
      .default('Medium')
      .messages({
        'any.only': 'Priority must be: Critical, High, Medium, or Low'
      }),
    estimated_duration: Joi.number()
      .min(0.5)
      .max(8)
      .default(2)
      .messages({
        'number.min': 'Duration must be at least 30 minutes (0.5 hours)',
        'number.max': 'Duration cannot exceed 8 hours'
      }),
    assigned_technician: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid technician ID format'
      }),
    notes: Joi.string()
      .trim()
      .optional()
      .max(1000)
      .messages({
        'string.max': 'Notes must be less than 1000 characters'
      }),
    estimated_cost: Joi.number()
      .min(0)
      .default(0)
      .messages({
        'number.min': 'Cost cannot be negative'
      }),
    recurrence: Joi.object({
      type: Joi.string()
        .valid('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')
        .default('none'),
      interval: Joi.number().min(1).default(1),
      end_date: Joi.date().optional()
    }).optional()
  }),
  
  update: Joi.object({
    equipment_id: Joi.string()
      .trim()
      .pattern(/^EQ-\d+$/)
      .uppercase()
      .optional()
      .messages({
        'string.pattern.base': 'Equipment ID must be in format EQ-1234'
      }),
    title: Joi.string().trim().max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
    scheduled_date: Joi.date().optional(),
    scheduled_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    maintenance_type: Joi.string().valid('Preventive', 'Repair', 'Inspection', 'Calibration', 'Cleaning').optional(),
    priority: Joi.string().valid('Critical', 'High', 'Medium', 'Low').optional(),
    estimated_duration: Joi.number().min(0.5).max(8).optional(),
    assigned_technician: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid technician ID format'
      }),
    status: Joi.string().valid('Scheduled', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled').optional(),
    notes: Joi.string().trim().max(1000).optional(),
    estimated_cost: Joi.number().min(0).optional(),
    recurrence: Joi.object({
      type: Joi.string()
        .valid('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')
        .optional(),
      interval: Joi.number().min(1).optional(),
      end_date: Joi.date().optional()
    }).optional()
  }).min(1),
  
  assign: Joi.object({
    technician_id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid technician ID format',
        'any.required': 'Technician ID is required'
      })
  }),
  
  complete: Joi.object({
    completion_notes: Joi.string()
      .trim()
      .optional()
      .max(1000)
      .messages({
        'string.max': 'Completion notes must be less than 1000 characters'
      }),
    actual_duration: Joi.number()
      .min(0)
      .max(12)
      .optional()
      .messages({
        'number.min': 'Actual duration cannot be negative',
        'number.max': 'Actual duration seems too long (max 12 hours)'
      }),
    actual_cost: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Actual cost cannot be negative'
      }),
    equipment_status_after: Joi.string()
      .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair')
      .optional()
      .messages({
        'any.only': 'Equipment status must be: Operational, Under Maintenance, Out of Service, or Needs Repair'
      })
  }),
  
  statusUpdate: Joi.object({
    status: Joi.string()
      .valid('Scheduled', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled')
      .required()
      .messages({
        'any.only': 'Status must be: Scheduled, Assigned, In Progress, Completed, Cancelled, or Rescheduled',
        'any.required': 'Status is required'
      }),
    notes: Joi.string()
      .trim()
      .optional()
      .max(1000)
      .messages({
        'string.max': 'Notes must be less than 1000 characters'
      })
  })
};

/**
 * Scheduled Maintenance validation middleware functions
 */
const validateScheduledMaintenanceCreate = () => {
  return validateWithJoi(scheduledMaintenanceSchemas.create);
};

const validateScheduledMaintenanceUpdate = () => {
  return validateWithJoi(scheduledMaintenanceSchemas.update);
};

const validateScheduledMaintenanceAssign = () => {
  return validateWithJoi(scheduledMaintenanceSchemas.assign);
};

const validateScheduledMaintenanceComplete = () => {
  return validateWithJoi(scheduledMaintenanceSchemas.complete);
};

const validateScheduledMaintenanceStatusUpdate = () => {
  return validateWithJoi(scheduledMaintenanceSchemas.statusUpdate);
};

module.exports = {
  validateObjectId,
  validateObjectIdArray,
  validateWithJoi,
  authSchemas,
  maintenanceRequestSchemas,
  equipmentSchemas,
  validateEquipmentCreate,
  validateEquipmentUpdate,
  validateEquipmentStatusUpdate,
  scheduledMaintenanceSchemas,
  validateScheduledMaintenanceCreate,
  validateScheduledMaintenanceUpdate,
  validateScheduledMaintenanceAssign,
  validateScheduledMaintenanceComplete,
  validateScheduledMaintenanceStatusUpdate
};
