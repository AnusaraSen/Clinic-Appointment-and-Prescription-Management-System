const mongoose = require('mongoose');
const LabStaff = require('../modules/workforce-facility/models/LabStaff');
const User = require('../modules/workforce-facility/models/User');
require('dotenv').config();

async function testLabStaff() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check existing lab staff
    const labStaff = await LabStaff.find({}).populate('user', 'name email');
    console.log('Existing Lab Staff:', labStaff.length);
    
    if (labStaff.length > 0) {
      console.log('First lab staff member:', JSON.stringify(labStaff[0], null, 2));
    } else {
      console.log('No lab staff found in database');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLabStaff();