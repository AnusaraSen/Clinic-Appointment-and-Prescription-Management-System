/**
 * Debug auth controller to isolate the issue
 */

// Mock auth controller to test if the issue is in the controller
const debugLogin = async (req, res) => {
  try {
    console.log('🔍 Debug login called with:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    console.log('✅ Credentials provided, attempting to import User model...');
    
    // Try to import User model - this might be where it crashes
    const User = require('../../workforce-facility/models/User');
    console.log('✅ User model imported');
    
    // Try to find user
    console.log('🔍 Looking for user in database...');
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('✅ Database query completed, user found:', !!user);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Mock successful response
    return res.json({
      success: true,
      message: 'Login successful (debug mode)',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Debug login error:', error);
    console.error('📍 Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Debug login failed',
      error: error.message
    });
  }
};

module.exports = {
  login: debugLogin
};