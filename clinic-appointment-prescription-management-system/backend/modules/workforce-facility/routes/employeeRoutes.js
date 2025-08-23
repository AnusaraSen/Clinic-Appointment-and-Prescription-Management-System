const express = require('express');
const { getAllEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');

/**
 * Employee Routes
 * Base path mounted at /api/employees in server.js
 *
 * GET    /            -> list employees
 * POST   /            -> create employee
 * GET    /:id         -> fetch single employee
 * PUT    /:id         -> full update (replace fields)
 * PATCH  /:id         -> partial update (same handler as PUT here)
 * DELETE /:id         -> delete employee
 */
const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.patch('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;


