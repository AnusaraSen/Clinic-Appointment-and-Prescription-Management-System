/**
 * Debug Authentication Test
 * Simple test to see detailed error messages
 */

const axios = require('axios');

async function debugLogin() {
  console.log('🔍 Debug Authentication Test\n');
  
  const testUser = {
    email: 'nimal.admin@example.com',
    password: '4TLRT!hD'
  };
  
  console.log('Attempting login with:');
  console.log(`Email: ${testUser.email}`);
  console.log(`Password: ${testUser.password}\n`);
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Login failed');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
    }
  }
}

debugLogin();
