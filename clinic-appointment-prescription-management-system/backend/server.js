const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const connectToDatabase = require('./config/db');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const employeeRoutes = require('./modules/workforce-facility/routes/employeeRoutes');
const maintenanceRequestRoutes = require('./modules/workforce-facility/routes/maintenanceRequestRoutes');
app.use('/api/employees', employeeRoutes);
app.use('/api/maintenance-requests', maintenanceRequestRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', db: dbStatus });
});

// 404 for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

// Process-level safety nets
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});


