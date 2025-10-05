/**
 * Authentication Test Script
 * Tests login with migrated user credentials
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🧪 Testing Authentication System\n');
  
  // Test data from migration results
  const testUsers = [
    {
      email: 'nimal.admin@example.com',
      password: '4TLRT!hD',
      role: 'Admin',
      name: 'Nimal'
    },
    {
      email: 'johndoe@example.com', 
      password: 'TempPass123!',
      role: 'Patient',
      name: 'John Doe'
    }
  ];

  for (const user of testUsers) {
    console.log(`🔐 Testing login for ${user.name} (${user.role})...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      console.log(`✅ Login successful!`);
      console.log(`   • Access Token: ${response.data.data.accessToken.substring(0, 30)}...`);
      console.log(`   • Refresh Token: ${response.data.data.refreshToken.substring(0, 30)}...`);
      console.log(`   • User: ${response.data.data.user.name} (${response.data.data.user.role})`);
      console.log(`   • First Login: ${response.data.data.user.isFirstLogin}`);
      
      // Test getting current user info
      const userInfoResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${response.data.data.accessToken}`
        }
      });
      
      console.log(`   • Profile fetch: Success ✅`);
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

async function testInvalidLogin() {
  console.log('🧪 Testing Invalid Credentials\n');
  
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    console.log(`✅ Invalid login properly rejected: ${error.response?.data?.message}`);
  }
  
  console.log('');
}

async function main() {
  try {
    console.log('🚀 Starting Authentication Tests');
    console.log('Make sure the server is running on http://localhost:5000\n');
    
    await testLogin();
    await testInvalidLogin();
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Make sure the backend server is running: npm run dev');
    }
  }
}

main();
