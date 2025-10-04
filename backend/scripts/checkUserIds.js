/**
 * Check User ID formats
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/workforce-facility/models/User');

async function checkUserIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const users = await User.find({}).select('user_id email name').limit(10);
    
    console.log('📋 Current user_id formats:\n');
    console.log('| User ID | Email                    | Name           |');
    console.log('|---------|--------------------------|----------------|');
    
    users.forEach(user => {
      const userId = user.user_id.padEnd(7);
      const email = user.email.padEnd(24);
      const name = user.name.padEnd(14);
      console.log(`| ${userId} | ${email} | ${name} |`);
    });
    
    console.log('\n🔍 Schema expects format: USR-1234');
    console.log('🔍 Actual format found: U004, etc.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

checkUserIds();
