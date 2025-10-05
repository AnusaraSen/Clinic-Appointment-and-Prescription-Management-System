/**
 * Token Generation Test
 */

require('dotenv').config();
const { generateTokenPair } = require('../utils/tokenUtils');

const testUser = {
  _id: '6703fee4e3f0d123456789',
  email: 'nimal.admin@example.com',
  role: 'Admin',
  name: 'Nimal'
};

console.log('🧪 Testing token generation\n');

try {
  const tokens = generateTokenPair(testUser);
  console.log('✅ Token generation successful!');
  console.log('Access token length:', tokens.accessToken.length);
  console.log('Refresh token length:', tokens.refreshToken.length);
  console.log('Access token preview:', tokens.accessToken.substring(0, 50) + '...');
  console.log('Refresh token preview:', tokens.refreshToken.substring(0, 50) + '...');
} catch (error) {
  console.log('❌ Token generation failed:', error.message);
}
