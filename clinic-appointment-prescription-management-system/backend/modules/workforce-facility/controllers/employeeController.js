const mongoose = require('mongoose');
const Joi = require('joi');
const Employee = require('../models/employeeDetails');

/**
 * GET /api/employees
 * Fetch all employees. Optional query param `populate` (default 'true') controls whether the linked
 * User document (user_id) is populated. We guard population with a runtime check so the service
 * does not crash if the User model hasn't been registered yet.
 */
async function getAllEmployees(req, res) {
  try {
    const shouldPopulate = (req.query.populate || 'true').toString().toLowerCase() === 'true';

    let query = Employee.find({});
    if (shouldPopulate && mongoose.models && mongoose.models.User) {
      query = query.populate('user_id');
    }

    const employees = await query.lean(); // lean() returns plain JS objects (faster, read-only use case)
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return res.status(500).json({ message: 'Failed to fetch employees' });
  }
}

// Validation schema for creating a new employee.
// NOTE: If you add new fields to the Mongoose schema, remember to update validation here.
const createEmployeeSchema = Joi.object({
  user_id: Joi.string().required(),
  role: Joi.string()
    .valid('doctor', 'pharmacist', 'lab_assistant', 'admin', 'nurse', 'other')
    .required(),
  department: Joi.string().allow('', null),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  base_working_hours: Joi.string().optional(),
  modified_hours_requests: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().required(),
        requested_hours: Joi.string().required(),
        status: Joi.string().valid('pending', 'approved', 'rejected').optional()
      })
    )
    .optional(),
  status: Joi.string().valid('active', 'terminated', 'inactive').optional()
});

/**
 * POST /api/employees
 * Create a new employee record. Validates request body against Joi schema.
 */
async function createEmployee(req, res) {
  try {
    const { value, error } = createEmployeeSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message)
      });
    }

    const employee = await Employee.create(value);
    const populatedEmployee = mongoose.models && mongoose.models.User
      ? await employee.populate('user_id')
      : employee;

    return res.status(201).json(populatedEmployee);
  } catch (err) {
    console.error('Failed to create employee:', err);
    return res.status(500).json({ message: 'Failed to create employee' });
  }
}

// Validation schema for partial updates. At least one field must be present (min(1)).
const updateEmployeeSchema = Joi.object({
  user_id: Joi.string().optional(),
  role: Joi.string().valid('doctor', 'pharmacist', 'lab_assistant', 'admin', 'nurse', 'other').optional(),
  department: Joi.string().allow('', null).optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().allow(null).optional(),
  base_working_hours: Joi.string().optional(),
  modified_hours_requests: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().required(),
        requested_hours: Joi.string().required(),
        status: Joi.string().valid('pending', 'approved', 'rejected').optional()
      })
    )
    .optional(),
  status: Joi.string().valid('active', 'terminated', 'inactive').optional()
}).min(1);

/**
 * PUT/PATCH /api/employees/:id
 * Update an existing employee. Accepts partial payload.
 */
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const { value, error } = updateEmployeeSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((d) => d.message)
      });
    }

    const shouldPopulate = (req.query.populate || 'true').toString().toLowerCase() === 'true';

    const updated = await Employee.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const result = shouldPopulate && mongoose.models && mongoose.models.User
      ? await updated.populate('user_id')
      : updated;

    return res.status(200).json(result);
  } catch (err) {
    console.error('Failed to update employee:', err);
    return res.status(500).json({ message: 'Failed to update employee' });
  }
}

/**
 * GET /api/employees/:id
 * Fetch a single employee by MongoDB ObjectId. Supports optional population.
 */
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const shouldPopulate = (req.query.populate || 'true').toString().toLowerCase() === 'true';

    let query = Employee.findById(id);
    if (shouldPopulate && mongoose.models && mongoose.models.User) {
      query = query.populate('user_id');
    }

    const employee = await query.lean();
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error('Failed to fetch employee by id:', error);
    return res.status(500).json({ message: 'Failed to fetch employee' });
  }
}

/**
 * DELETE /api/employees/:id
 * Permanently remove an employee document. Returns 204 (no content) on success.
 */
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Failed to delete employee:', err);
    return res.status(500).json({ message: 'Failed to delete employee' });
  }
}

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  getEmployeeById,
  deleteEmployee
};



