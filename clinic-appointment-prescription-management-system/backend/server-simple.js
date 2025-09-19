const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Initialize app and config
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});

// Import and use routes that exist
try {
  const pharmacistRoutes = require('./modules/workforce-facility/routes/pharmacistRoutes');
  app.use('/api/pharmacist', pharmacistRoutes);
  console.log('✓ Pharmacist routes loaded');
} catch (error) {
  console.log('⚠ Pharmacist routes not loaded:', error.message);
}

try {
  const medicineRoutes = require('./modules/pharmacy-inventory/routes/medicineRoutes');
  app.use('/api/medicines', medicineRoutes);
  console.log('✓ Medicine routes loaded');
} catch (error) {
  console.log('⚠ Medicine routes not loaded:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`💊 Pharmacist API: http://localhost:${PORT}/api/pharmacist`);
});