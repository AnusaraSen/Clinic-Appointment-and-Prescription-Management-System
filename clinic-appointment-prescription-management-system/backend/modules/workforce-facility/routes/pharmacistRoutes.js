const express = require('express');
const router = express.Router();

// Import controller functions
const {
  registerPharmacist,
  loginPharmacist,
  getDashboard,
  getProfile,
  updateProfile,
  getPrescriptions,
  getPrescriptionDetails,
  dispenseMedication,
  updatePrescriptionStatus,
  logoutPharmacist
} = require('../controllers/pharmacistController');

// Public routes (no authentication required)
router.post('/register', registerPharmacist);
router.post('/login', loginPharmacist);

// Dashboard and profile routes (made public)
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Prescription management routes (made public)
router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:id', getPrescriptionDetails);

// Medication dispensing routes (made public)
router.post('/prescriptions/:id/dispense', dispenseMedication);

// Prescription status management (made public)
router.put('/prescriptions/:id/status', updatePrescriptionStatus);

// Logout route
router.post('/logout', logoutPharmacist);

module.exports = router;