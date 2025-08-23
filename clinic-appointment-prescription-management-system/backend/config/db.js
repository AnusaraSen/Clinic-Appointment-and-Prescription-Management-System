const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using the MONGO_URI env var.
 * Exits the process early if configuration is missing or the initial connection fails.
 * Adds graceful shutdown handlers so the Node.js process can close DB connections cleanly.
 *
 * @returns {Promise<void>} resolves once connected.
 */
async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Missing MONGO_URI in environment variables');
    process.exit(1);
  }

  try {
    const connectionOptions = {};
    if (process.env.MONGO_DB_NAME) {
      // Optional override to target a specific database within the cluster.
      connectionOptions.dbName = process.env.MONGO_DB_NAME;
    }

    const connection = await mongoose.connect(mongoUri, connectionOptions);
    console.log(`MongoDB connected: ${connection.connection.host}`);

    /**
     * Graceful shutdown helper. Ensures any in-flight operations finish and
     * connections are closed before exiting the process.
     * @param {string} signal - The OS signal or reason triggering shutdown.
     */
    const close = async (signal) => {
      try {
        await mongoose.connection.close();
        console.log(`MongoDB connection closed due to ${signal}`);
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => close('SIGINT'));
    process.on('SIGTERM', () => close('SIGTERM'));
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;


