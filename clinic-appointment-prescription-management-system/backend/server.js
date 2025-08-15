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
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const employeeRoutes = require('./modules/workforce-facility/routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

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

const PORT = process.env.PORT || 5000;

(async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();


