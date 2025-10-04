/**
 * Direct Controller Test
 * Test the login method directly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuthController = require('../modules/auth/controllers/AuthController');

// Mock request and response objects
const mockReq = {
  body: {
    email: 'nimal.admin@example.com',
    password: '4TLRT!hD'
  },
  rateLimit: {
    remaining: 10
  }
};

const mockRes = {
  status: (code) => {
    mockRes.statusCode = code;
    return mockRes;
  },
  json: (data) => {
    console.log(`Response Status: ${mockRes.statusCode}`);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

async function testDirectLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🧪 Testing login controller directly\n');
    console.log('Request data:');
    console.log(JSON.stringify(mockReq.body, null, 2));
    console.log('');
    
    await AuthController.login(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Controller test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testDirectLogin();
