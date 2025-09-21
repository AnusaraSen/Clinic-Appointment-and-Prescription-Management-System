const express = require('express');
const router = express.Router();

// Placeholder pharmacist route
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Pharmacist routes placeholder' });
});

module.exports = router;
