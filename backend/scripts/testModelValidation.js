const mongoose = require('mongoose');
require('dotenv').config();

// Import the updated LabSupervisor model
const LabSupervisor = require('../modules/workforce-facility/models/LabSupervisor');
const User = require('../modules/workforce-facility/models/User');

const testModelValidation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test user first
    const testUser = new User({
      user_id: 'USR-8888',
      name: 'Test User Model',
      email: 'test.model.unique@example.com',
      password: 'Test123!@#',
      role: 'LabSupervisor',
      department: 'Laboratory',
      phone: '+1-555-0000'
    });

    const savedUser = await testUser.save();
    console.log('✅ Test User created:', savedUser.user_id);

    // Now test LabSupervisor with correct field name
    const testLabSupervisor = new LabSupervisor({
      supervisor_id: 'LSUP-8888',  // Using supervisor_id field
      user: savedUser._id,
      department: 'Laboratory',
      managedSections: ['Testing'],
      notes: 'Test supervisor'
    });

    console.log('🧪 Testing LabSupervisor validation...');
    console.log('Field being used: supervisor_id');
    console.log('Value: LSUP-8888');

    // Try to save and see what happens
    const savedSupervisor = await testLabSupervisor.save();
    console.log('✅ LabSupervisor created successfully!');
    console.log('ID:', savedSupervisor.supervisor_id);

    // Clean up
    await LabSupervisor.deleteOne({ _id: savedSupervisor._id });
    await User.deleteOne({ _id: savedUser._id });
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Model validation error:', error);
    console.error('Error message:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Field ${key}:`, error.errors[key].message);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

testModelValidation();