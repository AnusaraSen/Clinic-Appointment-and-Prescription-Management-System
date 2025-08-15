const mongoose = require('mongoose');
const Joi = require('joi');
const Employee = require('../models/employeeDetails');

async function getAllEmployees(req, res) {
  try {
    const shouldPopulate = (req.query.populate || 'true').toString().toLowerCase() === 'true';

    let query = Employee.find({});
    if (shouldPopulate && mongoose.models && mongoose.models.User) {
      query = query.populate('user_id');
    }

    const employees = await query.lean();
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return res.status(500).json({ message: 'Failed to fetch employees' });
  }
}

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



