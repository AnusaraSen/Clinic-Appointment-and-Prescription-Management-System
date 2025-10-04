const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Token Utilities - JWT Authentication Magic! 🎯
 * 
 * Handles JWT token generation, validation, and refresh logic
 * Access Token: 15 minutes | Refresh Token: 7 days
 */

// Token durations
const ACCESS_TOKEN_DURATION = '15m';  // 15 minutes
const REFRESH_TOKEN_DURATION = '7d';  // 7 days

// JWT Secrets (in production, these should be in environment variables)
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'clinic_access_secret_dev_2024';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'clinic_refresh_secret_dev_2024';

/**
 * Generate access token (short-lived)
 * @param {Object} payload - User data to include in token
 * @returns {string} - JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    const tokenPayload = {
      userId: payload.userId || payload._id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      tokenType: 'access'
    };

    const token = jwt.sign(tokenPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_DURATION,
      issuer: 'clinic-management-system',
      audience: 'clinic-users'
    });

    console.log('🎯 Access token generated for user:', payload.email);
    return token;
  } catch (error) {
    console.error('❌ Error generating access token:', error.message);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - User data to include in token
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const tokenPayload = {
      userId: payload.userId || payload._id,
      email: payload.email,
      tokenType: 'refresh',
      // Add random component to make each refresh token unique
      jti: crypto.randomBytes(16).toString('hex')
    };

    const token = jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_DURATION,
      issuer: 'clinic-management-system',
      audience: 'clinic-users'
    });

    console.log('🔄 Refresh token generated for user:', payload.email);
    return token;
  } catch (error) {
    console.error('❌ Error generating refresh token:', error.message);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'clinic-management-system',
      audience: 'clinic-users'
    });

    if (decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }

    console.log('✅ Access token verified for user:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('❌ Access token verification failed:', error.message);
    
    // Provide specific error messages
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    if (!token) {
      throw new Error('No refresh token provided');
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'clinic-management-system',
      audience: 'clinic-users'
    });

    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }

    console.log('✅ Refresh token verified for user:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('❌ Refresh token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} - { accessToken, refreshToken }
 */
const generateTokenPair = (user) => {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log('🎯 Token pair generated for user:', user.email);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_DURATION
    };
  } catch (error) {
    console.error('❌ Error generating token pair:', error.message);
    throw error;
  }
};

/**
 * Extract token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} - Token string or null
 */
const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Decode token without verification (useful for extracting expired token data)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('❌ Error decoding token:', error.message);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractTokenFromHeader,
  decodeToken,
  ACCESS_TOKEN_DURATION,
  REFRESH_TOKEN_DURATION
};
