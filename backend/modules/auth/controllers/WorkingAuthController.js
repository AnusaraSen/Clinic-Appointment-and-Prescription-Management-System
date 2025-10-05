/**
 * Working Auth Controller - Simplified without problematic dependencies
 */

const User = require('../../workforce-facility/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Login function that actually works
 */
const login = async (req, res) => {
  try {
    console.log('🚪 Working login attempt:', req.body);
    
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('👤 User found:', !!user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Debug: Check user status
    console.log('📊 User isActive:', user.isActive);
    console.log('📊 User status:', user.status);

    // Check if user is active (handle both isActive boolean and status string)
    const isUserActive = user.isActive === true || user.isActive === 1 || 
                         user.status === 'active' || user.status === 'Active' || user.status === 'ACTIVE';
    
    if (!isUserActive) {
      console.log('❌ User not active. isActive:', user.isActive, 'status:', user.status);
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password using User model method
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login successful for user:', user.email);

    // Return success response
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          user_id: user.user_id
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'LOGIN_ERROR'
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res) => {
  try {
    console.log('🔄 Refresh token attempt:', req.body);
    
    const { refreshToken } = req.body;

    // Basic validation
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    } catch (error) {
      console.log('❌ Invalid refresh token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user is still active
    const isUserActive = user.isActive === true || user.isActive === 1 || 
                         user.status === 'active' || user.status === 'Active' || user.status === 'ACTIVE';
    
    if (!isUserActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Token refresh successful for user:', user.email);

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'REFRESH_ERROR'
    });
  }
};

/**
 * Logout function
 */
const logout = async (req, res) => {
  try {
    // In a real implementation, you'd invalidate the token
    // For now, just return success
    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

module.exports = {
  login,
  refreshToken,
  logout
};