const mongoose = require('mongoose');
const Employee = require('../models/EmployeeDetails');

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

module.exports = {
  getAllEmployees,
};


