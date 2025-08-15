const mongoose = require('mongoose');

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Missing MONGO_URI in environment variables');
    process.exit(1);
  }

  try {
    const connectionOptions = {};
    if (process.env.MONGO_DB_NAME) {
      connectionOptions.dbName = process.env.MONGO_DB_NAME;
    }

    const connection = await mongoose.connect(mongoUri, connectionOptions);
    console.log(`MongoDB connected: ${connection.connection.host}`);

    // Graceful shutdown
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


