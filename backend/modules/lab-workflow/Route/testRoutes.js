const express = require('express');
const router = express.Router();
const { testConnection, getMockLabTests } = require('../Controllers/testController');

// Test routes that don't require database
router.get('/test', testConnection);
router.get('/mock-lab-tests', getMockLabTests);

module.exports = router;