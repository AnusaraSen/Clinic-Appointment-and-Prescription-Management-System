/**
 * Database Debug Test
 * Check user data directly from database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/workforce-facility/models/User');

async function debugUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const testEmail = 'nimal.admin@example.com';
    console.log(`🔍 Looking for user: ${testEmail}`);
    
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found!');
    console.log('User details:');
    console.log(`  • Name: ${user.name}`);
    console.log(`  • Email: ${user.email}`);
    console.log(`  • Role: ${user.role}`);
    console.log(`  • Has password: ${!!user.password}`);
    console.log(`  • Password length: ${user.password ? user.password.length : 0}`);
    console.log(`  • Is active: ${user.isActive}`);
    console.log(`  • Login attempts: ${user.loginAttempts || 0}`);
    console.log(`  • Is locked: ${user.isLocked}`);
    console.log(`  • First login: ${user.isFirstLogin}`);
    
    // Test password comparison
    const testPassword = '4TLRT!hD';
    console.log(`\n🔐 Testing password comparison with: ${testPassword}`);
    
    try {
      const isValid = await user.comparePassword(testPassword);
      console.log(`Password is valid: ${isValid}`);
    } catch (error) {
      console.log('❌ Error comparing password:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

debugUser();
