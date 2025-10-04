const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../modules/workforce-facility/models/User');
const LabSupervisor = require('../modules/workforce-facility/models/LabSupervisor');
const LabStaff = require('../modules/workforce-facility/models/LabStaff');

const cleanupAndRecreateLabUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clean up existing records
    console.log('🧹 Cleaning up existing lab users...');
    
    // Find existing users
    const supervisorUser = await User.findOne({ email: 'supervisor@lab.com' });
    const assistantUser = await User.findOne({ email: 'assistant@lab.com' });

    // Remove related LabSupervisor and LabStaff records
    if (supervisorUser) {
      await LabSupervisor.deleteMany({ user: supervisorUser._id });
      await User.deleteOne({ _id: supervisorUser._id });
      console.log('🗑️ Removed existing lab supervisor');
    }

    if (assistantUser) {
      await LabStaff.deleteMany({ user: assistantUser._id });
      await User.deleteOne({ _id: assistantUser._id });
      console.log('🗑️ Removed existing lab assistant');
    }

    console.log('✅ Cleanup completed, now creating new users...');

    // Import the updated creation logic
    const createLabSupervisor = require('./createLabSupervisor');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

cleanupAndRecreateLabUsers();