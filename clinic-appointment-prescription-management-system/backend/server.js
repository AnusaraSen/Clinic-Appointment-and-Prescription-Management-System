/**
 * Application entrypoint.
 *
 * This file is responsible for:
 *  - Loading environment variables.
 *  - Creating and configuring the Express app instance (security, parsing, logging middleware).
 *  - Registering versioned API route groups.
 *  - Exposing a /health endpoint for lightweight liveness / DB state checks.
 *  - Centralising 404 handling and a final error handler so unhandled errors return JSON.
 *  - Connecting to MongoDB before starting the HTTP server.
 *  - Adding process-level safety nets for unexpected promise rejections / exceptions.
 *
 * NOTE for junior developers:
 *  Keep this file thin. Business logic should live in controllers/services. If this file starts
 *  growing large, consider extracting config blocks (e.g. security middleware) into dedicated modules.
 */

require('dotenv').config(); // Load .env first so all subsequent requires can access variables.

const express = require('express');
const mongoose = require('mongoose');
// Centralised middleware imports
const { corsMiddleware, parsers, logger, notFound, errorHandler } = require('./middleware');

const connectToDatabase = require('./config/db');

// Create the Express application instance.
const app = express();

/**
 * Global Middleware stack order matters:
 * 1. CORS: allow cross-origin requests (credentials true to support cookies / auth headers).
 * 2. Body parsers: JSON first then URL-encoded for form submissions.
 * 3. Cookie parser: so downstream middleware/routes can access req.cookies.
 * 4. Logger (morgan) last among common middleware to log final parsed request info.
 */
app.use(corsMiddleware);
app.use(parsers);
app.use(logger);

/**
 * Route Modules.
 * Each route file should only define routing / validation glue code and delegate logic
 * to a controller. This keeps them easy to scan & test.
 */
const employeeRoutes = require('./modules/workforce-facility/routes/employeeRoutes');
const maintenanceRequestRoutes = require('./modules/workforce-facility/routes/maintenanceRequestRoutes');
const externalCompanyRoutes = require('./modules/workforce-facility/routes/externalCompanies');

// Mount route groups under a common /api namespace for clarity + future versioning (e.g. /api/v1/...)
app.use('/api/employees', employeeRoutes);
app.use('/api/maintenance-requests', maintenanceRequestRoutes);
app.use('/api/external-companies', externalCompanyRoutes);

/**
 * Liveness / readiness probe.
 * Returns basic status so monitoring tools (or developers via Postman) can quickly assess health.
 * In production you might separate liveness (process up) vs readiness (DB connected), but here we combine.
 */
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

/**
 * 404 Handler.
 * This MUST come after all route registrations so only unmatched requests get here.
 */
app.use(notFound);

/**
 * Central Error Handler.
 * Any thrown error (or passed via next(err)) will land here.
 * DO NOT leak internal error details to clients in production.
 */
app.use(errorHandler);

// Configurable port (default 5000 for local dev consistency).
const PORT = process.env.PORT || 5000;

/**
 * Async IIFE to await DB connection before starting the server.
 * Ensures we fail fast if the database is unreachable instead of accepting requests we can't serve.
 */
(async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

/**
 * Process-level Safety Nets.
 * If an unhandled rejection / exception occurs we log then exit so a process manager (PM2, Docker, etc.)
 * can restart the service in a clean state. Avoid swallowing these silently.
 */
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app; // Export for testing (supertest, etc.).


