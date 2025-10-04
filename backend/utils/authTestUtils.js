/**
 * Authentication Test Utility - Verify Setup! 🧪
 * 
 * Quick tests to ensure password hashing and JWT tokens work correctly
 * Run this file to test the authentication setup
 */

const { validatePasswordFormat, hashPassword, comparePassword, generateTempPassword } = require('./passwordUtils');
const { generateTokenPair, verifyAccessToken, verifyRefreshToken } = require('./tokenUtils');

const testAuthentication = async () => {
  console.log('🧪 Testing Authentication Setup...\n');

  try {
    // Test 1: Password validation
    console.log('📝 Test 1: Password Validation');
    const validPassword = 'admin123!';
    const invalidPassword = '123'; // Too short, no special char
    
    const validResult = validatePasswordFormat(validPassword);
    const invalidResult = validatePasswordFormat(invalidPassword);
    
    console.log('✅ Valid password result:', validResult);
    console.log('❌ Invalid password result:', invalidResult);
    console.log('');

    // Test 2: Password hashing and comparison
    console.log('🔐 Test 2: Password Hashing');
    const testPassword = 'test123!';
    const hashedPassword = await hashPassword(testPassword);
    
    console.log('Original password:', testPassword);
    console.log('Hashed password:', hashedPassword);
    
    const isMatch1 = await comparePassword(testPassword, hashedPassword);
    const isMatch2 = await comparePassword('wrong123!', hashedPassword);
    
    console.log('Correct password match:', isMatch1);
    console.log('Wrong password match:', isMatch2);
    console.log('');

    // Test 3: Token generation and verification
    console.log('🎯 Test 3: JWT Tokens');
    const mockUser = {
      _id: '68b2d9e68ec1571a1d749e2b',
      email: 'nimal.admin@example.com',
      role: 'Admin',
      name: 'Nimal'
    };

    const tokens = generateTokenPair(mockUser);
    console.log('Generated tokens:', {
      accessToken: tokens.accessToken.substring(0, 50) + '...',
      refreshToken: tokens.refreshToken.substring(0, 50) + '...',
      expiresIn: tokens.expiresIn
    });

    // Verify tokens
    const accessDecoded = verifyAccessToken(tokens.accessToken);
    const refreshDecoded = verifyRefreshToken(tokens.refreshToken);
    
    console.log('Access token decoded:', {
      userId: accessDecoded.userId,
      email: accessDecoded.email,
      role: accessDecoded.role,
      tokenType: accessDecoded.tokenType
    });
    
    console.log('Refresh token decoded:', {
      userId: refreshDecoded.userId,
      email: refreshDecoded.email,
      tokenType: refreshDecoded.tokenType
    });
    console.log('');

    // Test 4: Temporary password generation
    console.log('🎲 Test 4: Temporary Password Generation');
    const tempPassword1 = generateTempPassword();
    const tempPassword2 = generateTempPassword();
    const tempPassword3 = generateTempPassword();
    
    console.log('Generated temp passwords:', [tempPassword1, tempPassword2, tempPassword3]);
    
    // Validate they meet requirements
    const tempValidation = validatePasswordFormat(tempPassword1);
    console.log('Temp password validation:', tempValidation);
    console.log('');

    console.log('🎉 All authentication tests completed successfully!');
    console.log('✅ Setup is ready for implementation');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthentication();
}

module.exports = { testAuthentication };
