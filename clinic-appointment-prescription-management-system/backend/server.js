/**
 * Hey there! Welcome to our clinic management system! 🏥
 * 
 * This is the main server file - think of it as the front desk of our app.
 * It handles the basics like:
 *  - Setting up our environment (loading secrets from .env)
 *  - Configuring Express to handle requests nicely
 *  - Connecting all our different parts (routes, middleware, database)
 *  - Making sure everything talks to each other properly
 *
 * Pro tip: Keep this file clean and simple! 
 * The real magic happens in controllers and services - this is just the coordinator.
 */

require('dotenv').config(); // First things first - grab our secrets from .env

const express = require('express');
const mongoose = require('mongoose');
// All our handy middleware helpers, nicely organized
const { 
  corsMiddleware, 
  parsers, 
  logger, 
  notFound, 
  errorHandler,
  validation,
  queryProcessing,
  responseFormatting,
  resourceValidation
} = require('./middleware');

const connectToDatabase = require('./config/db');

// Let's create our Express app - this is where the magic begins! ✨
const app = express();

/**
 * Setting up middleware (think of these as helpful assistants):
 * 1. CORS: Lets our frontend talk to our backend without browser complaints
 * 2. Body parsers: Helps us understand JSON and form data from requests
 * 3. Cookie parser: So we can read cookies (useful for auth later)
 * 4. Logger: Keeps track of what's happening (great for debugging!)
 */
app.use(corsMiddleware);
app.use(parsers);
app.use(logger);

/**
 * Our API Routes - This is where the real work happens! 🚀
 * 
 * For now, we're keeping it simple and focused - just maintenance requests.
 * When you need more endpoints later, just add the route files and import them here!
 */
const maintenanceRequestRoutes = require('./modules/workforce-facility/routes/maintenanceRequestRoutes');

// Hook up our routes - clean and simple for now
app.use('/api/maintenance-requests', maintenanceRequestRoutes);

// Future routes can go here when you need them:
// const userRoutes = require('./modules/workforce-facility/routes/userRoutes');
// const technicianRoutes = require('./modules/workforce-facility/routes/technicianRoutes');
// const equipmentRoutes = require('./modules/workforce-facility/routes/equipmentRoutes');
// app.use('/api/users', userRoutes);
// app.use('/api/technicians', technicianRoutes);
// app.use('/api/equipment', equipmentRoutes);

/**
 * Health Check Endpoint - Is everything okay? 🩺
 * This is super handy for monitoring tools and quick debugging.
 * Hit /health to see if our server and database are playing nice together.
 */
app.get('/health', (req, res) => {
  // Simple mapping to understand what mongoose is telling us
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = dbStates[mongoose.connection.readyState] || 'unknown';
  
  // Pack up some useful info about our system
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'not connected yet'
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(healthInfo);
});

/**
 * Catch-all for routes that don't exist - the 404 handler
 * This needs to come AFTER all our real routes, so it only catches the strays
 */
app.use(notFound);

/**
 * Our safety net for when things go wrong 🛟
 * Any error that gets thrown will end up here for proper handling
 * (We don't want to crash the whole server just because one request failed!)
 */
app.use(errorHandler);

// Where should we listen? Default to 5000 if nobody tells us otherwise
const PORT = process.env.PORT || 5000;

/**
 * Startup sequence - let's get this party started! 🎉
 * We need to connect to the database first, then start accepting requests.
 * No point accepting requests if we can't save anything, right?
 */
(async () => {
  try {
    // First, let's make sure we can talk to MongoDB
    await connectToDatabase();

    // Now we can start our server with confidence!
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is alive and kicking on port ${PORT}`);
      console.log(`📊 Check health: http://localhost:${PORT}/health`);
      console.log(`🔧 API playground: http://localhost:${PORT}/api`);
      console.log(`📝 Running in: ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Handle graceful shutdown (when someone hits Ctrl+C or the system wants us to stop)
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Got ${signal} signal. Time to wrap things up gracefully...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('Oops, had trouble shutting down the server:', err);
          process.exit(1);
        }
        
        try {
          // Close our database connection nicely
          await mongoose.connection.close();
          console.log('✅ Database said goodbye properly');
          console.log('✅ Server shutdown complete - see you later!');
          process.exit(0);
        } catch (dbErr) {
          console.error('Had trouble closing database connection:', dbErr);
          process.exit(1);
        }
      });

      // Don't wait forever - force quit after 10 seconds if needed
      setTimeout(() => {
        console.error('❌ Taking too long to shutdown, forcing it...');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals (Ctrl+C, system shutdown, etc.)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Couldn\'t start the server:', error);
    process.exit(1);
  }
})();

/**
 * Emergency safety nets for when things go really wrong 🚨
 * These catch problems that shouldn't happen in well-written code,
 * but it's better to log them than crash silently!
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Uh oh! A promise was rejected and nobody caught it:', promise);
  console.error('The reason:', reason);
  // Show the stack trace if we have one (super helpful for debugging)
  if (reason && reason.stack) {
    console.error('Stack trace:', reason.stack);
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 Caught an exception that wasn\'t handled:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

// Node.js likes to warn us about potential issues - let's listen
process.on('warning', (warning) => {
  console.warn('⚠️  Node.js heads up:', warning.name, '-', warning.message);
});

// Export our app so we can test it easily with tools like supertest
module.exports = app;


