const express = require('express');
const { getAllEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');


const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.patch('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);


module.exports = router;


