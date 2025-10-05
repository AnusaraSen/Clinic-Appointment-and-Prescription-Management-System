const User = require('../../workforce-facility/models/User');
const UserCreationService = require('../../../services/UserCreationService');
const { generateTokenPair, verifyRefreshToken } = require('../../../utils/tokenUtils');
const { validatePasswordFormat, generateTempPassword } = require('../../../utils/passwordUtils');

/**
 * Authentication Controller - Login/Logout Magic! 🔐
 * 
 * Handles user authentication, registration, and account management
 * Includes admin-only staff registration and patient self-registration
 */

/**
 * User Login
 * POST /api/auth/login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    console.log('🔐 Login attempt for:', email);

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password'); // Include password field

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      console.log('🔒 Account is locked:', email);
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.',
        error: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('🚫 Account is deactivated:', email);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if user has a password (some may not have set one yet)
    if (!user.password) {
      console.log('⚠️ User has no password set:', email);
      return res.status(401).json({
        success: false,
        message: 'Password not set. Please contact administrator.',
        error: 'NO_PASSWORD_SET'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      
      // Increment failed login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Save refresh token to user document
    user.refreshToken = tokens.refreshToken;
    await user.resetLoginAttempts(); // Reset failed attempts and update lastLogin
    await user.save();

    // Prepare user data (exclude sensitive fields)
    const userData = {
      id: user._id,
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      lastLogin: user.lastLogin
    };

    console.log('✅ Login successful for:', email, '| Role:', user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * User Logout
 * POST /api/auth/logout
 * @param {Object} req - Request object (with authenticated user)
 * @param {Object} res - Response object
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 }
    });

    console.log('✅ Logout successful for user:', req.user.email);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        error: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    console.log('🔄 Token refreshed for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        error: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: 'REFRESH_FAILED'
    });
  }
};

/**
 * Register New Staff Member (Admin Only)
 * POST /api/auth/register-staff
 * @param {Object} req - Request object (authenticated admin)
 * @param {Object} res - Response object
 */
const registerStaff = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      phone,
      address,
      age,
      gender,
      dob,
      password
    } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and role are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Create full name from firstName and lastName
    const name = `${firstName} ${lastName}`.trim();

    // Validate role (no Patients through this endpoint)
    const allowedRoles = ['Doctor', 'Pharmacist', 'Admin', 'LabStaff', 'InventoryManager', 'LabSupervisor', 'Technician'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for staff registration',
        error: 'INVALID_ROLE',
        allowedRoles
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        error: 'EMAIL_EXISTS'
      });
    }

    // Generate user ID - find the highest existing user number and increment
    const existingUsers = await User.find({ user_id: { $regex: /^USR-\d+$/ } }, { user_id: 1 });
    const userNumbers = existingUsers
      .map(u => parseInt(u.user_id.split('-')[1]))
      .filter(num => !isNaN(num));
    const maxUserNumber = userNumbers.length > 0 ? Math.max(...userNumbers) : 0;
    const user_id = `USR-${String(maxUserNumber + 1).padStart(4, '0')}`;

    // Use provided password or generate temporary one
    let userPassword = password;
    let isTemporary = false;
    
    if (!password) {
      userPassword = generateTempPassword();
      isTemporary = true;
    } else {
      // Validate password format
      const passwordValidation = validatePasswordFormat(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
          error: 'INVALID_PASSWORD_FORMAT'
        });
      }
    }

    // Prepare user data for cascade creation
    const userData = {
      user_id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      phone,
      address,
      age,
      gender,
      dob: dob ? new Date(dob) : undefined,
      password: userPassword,
      isFirstLogin: isTemporary,
      isActive: true
    };

    // Use UserCreationService for cascade creation
    const result = await UserCreationService.createUserWithRole(userData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Staff registration failed',
        error: result.message
      });
    }

    // Prepare response data (exclude password)
    const responseUserData = {
      id: result.user._id,
      user_id: result.user.user_id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      phone: result.user.phone,
      address: result.user.address,
      age: result.user.age,
      gender: result.user.gender,
      dob: result.user.dob,
      isActive: result.user.isActive,
      createdAt: result.user.createdAt
    };

    console.log('✅ Staff member registered:', email, '| Role:', role, '| By admin:', req.user.email);

    const response = {
      success: true,
      message: result.message,
      data: {
        user: responseUserData
      }
    };

    // Include role-specific data if created
    if (result.roleData) {
      response.data.roleData = result.roleData.toObject();
      response.data.roleCollection = UserCreationService.roleMapping[result.user.role]?.collection;
    }

    // Include temporary password in response if generated
    if (isTemporary) {
      response.data.temporaryPassword = userPassword;
      response.message += '. Temporary password generated.';
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Staff registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: 'EMAIL_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Staff registration failed',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Patient Self-Registration
 * POST /api/auth/register-patient
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const registerPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      age,
      gender,
      dob
    } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Create full name from firstName and lastName
    const name = `${firstName} ${lastName}`.trim();

    // Validate password format
    const passwordValidation = validatePasswordFormat(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
        error: 'INVALID_PASSWORD_FORMAT'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        error: 'EMAIL_EXISTS'
      });
    }

    // Generate user ID - find the highest existing user number and increment
    const existingUsers = await User.find({ user_id: { $regex: /^USR-\d+$/ } }, { user_id: 1 });
    const userNumbers = existingUsers
      .map(u => parseInt(u.user_id.split('-')[1]))
      .filter(num => !isNaN(num));
    const maxUserNumber = userNumbers.length > 0 ? Math.max(...userNumbers) : 0;
    const user_id = `USR-${String(maxUserNumber + 1).padStart(4, '0')}`;

    // Prepare patient data for cascade creation
    const patientData = {
      user_id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'Patient',
      phone,
      address,
      age,
      gender,
      dob: dob ? new Date(dob) : undefined,
      isFirstLogin: false,
      isActive: true
    };

    // Use UserCreationService for cascade creation
    const result = await UserCreationService.createUserWithRole(patientData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Patient registration failed',
        error: result.message
      });
    }

    // Generate login tokens immediately
    const tokens = generateTokenPair(result.user);
    result.user.refreshToken = tokens.refreshToken;
    await result.user.save();

    // Prepare response data (exclude password)
    const userData = {
      id: result.user._id,
      user_id: result.user.user_id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      phone: result.user.phone,
      address: result.user.address,
      age: result.user.age,
      gender: result.user.gender,
      dob: result.user.dob,
      isActive: result.user.isActive,
      createdAt: result.user.createdAt
    };

    console.log('✅ Patient registered and logged in:', email);

    const response = {
      success: true,
      message: result.message,
      data: {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    };

    // Include patient-specific data if created
    if (result.roleData) {
      response.data.patientData = result.roleData.toObject();
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Patient registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: 'EMAIL_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Patient registration failed',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 * @param {Object} req - Request object (authenticated user)
 * @param {Object} res - Response object
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already available from auth middleware
    const userData = {
      id: req.user._id,
      user_id: req.user.user_id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address,
      age: req.user.age,
      gender: req.user.gender,
      dob: req.user.dob,
      isActive: req.user.isActive,
      lastLogin: req.user.lastLogin,
      isFirstLogin: req.user.isFirstLogin,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  registerStaff,
  registerPatient,
  getCurrentUser
};
