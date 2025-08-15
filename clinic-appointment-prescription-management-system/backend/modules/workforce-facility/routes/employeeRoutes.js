const express = require('express');
const { getAllEmployees } = require('../controller/employeeController');

const router = express.Router();

router.get('/', getAllEmployees);

module.exports = router;


