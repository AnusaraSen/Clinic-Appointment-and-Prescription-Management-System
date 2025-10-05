const mongoose = require('mongoose');
require('dotenv').config();

// Import the UserCreationService
const UserCreationService = require('../services/UserCreationService');

const testLabSupervisorCreation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test data for creating a lab supervisor via UserCreationService
    const labSupervisorData = {
      name: 'Dr. Test Supervisor',
      email: 'test.supervisor@lab.com',
      password: 'Test123!@#',
      role: 'LabSupervisor',
      department: 'Laboratory',
      phone: '+1-555-9999',
      age: 45,
      gender: 'Male'
    };

    console.log('🧪 Testing LabSupervisor creation via UserCreationService...');
    
    // Create the user using UserCreationService
    const result = await UserCreationService.createUserWithRole(labSupervisorData);
    
    console.log('✅ LabSupervisor created successfully!');
    console.log('User ID:', result.user.user_id);
    console.log('Role Record ID:', result.roleData[UserCreationService.getRoleIdField('LabSupervisor')]);
    console.log('Role Collection:', UserCreationService.roleMapping['LabSupervisor'].collection);

  } catch (error) {
    console.error('❌ Error testing LabSupervisor creation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

testLabSupervisorCreation();