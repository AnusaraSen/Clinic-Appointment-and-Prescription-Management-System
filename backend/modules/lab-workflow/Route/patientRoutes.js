const express = require('express');
const router = express.Router();
const PatientController = require('../Controllers/patientController');

// Get all patients with search functionality
router.get('/', PatientController.getPatients);

// Search patients for task assignment (quick search)
router.get('/search', PatientController.searchPatientsForTask);

// Get patient by linked user ID (maps authenticated user to their Patient record)
router.get('/by-user/:userId', PatientController.getPatientByUser);

// Get specific patient by ID
router.get('/:id', PatientController.getPatientById);

// Get patient lab history
router.get('/:id/history', PatientController.getPatientLabHistory);

module.exports = router;