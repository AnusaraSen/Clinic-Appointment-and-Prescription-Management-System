/**
 * User Routes - Basic CRUD operations for users! 👤
 * 
 * These routes handle user management - perfect for your university project
 * to show how different parts of the system connect together.
 * Enhanced with cascade creation for role-specific collections.
 */

const express = require('express');
const User = require('../models/User');
const UserCreationService = require('../../../services/UserCreationService');
const UserReportsController = require('../controllers/UserReportsController');
const router = express.Router();

/**
 * REPORTS ROUTES - User Analytics 📊
 */
router.get('/reports/metrics', UserReportsController.getReportMetrics);
router.get('/reports/role-distribution', UserReportsController.getRoleDistribution);
router.get('/reports/registration-trend', UserReportsController.getRegistrationTrend);
router.get('/reports/activity', UserReportsController.getActivityData);
router.get('/reports/login-events', UserReportsController.getLoginEvents);
router.post('/reports/export-filtered', UserReportsController.exportFilteredUsers);
router.get('/:userId/export', UserReportsController.exportUserData);

/**
 * GET /api/users - Get all users 📋
 * Perfect for populating dropdown lists in forms!
 */
router.get('/', async (req, res) => {
  try {
    console.log('📋 Getting all users for dropdown...');
    
    const users = await User.find()
      .select('user_id name email role lockUntil isActive lastLogin') // Include lockUntil so virtual isLocked is available and lastLogin for reports table
      .sort({ name: 1 }); // Sort alphabetically by name
    
    console.log(`✅ Found ${users.length} users`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id - Get a specific user by ID 🎯
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

/**
 * POST /api/users - Create a new user with cascade creation
 * Enhanced to automatically create role-specific entries
 */
router.post('/', async (req, res) => {
  try {
    console.log('➕ POST /api/users called with body:', req.body);

    const { user_id, name, email, phone, address, age, gender, dob, role, password } = req.body || {};

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // If password not provided and role requires one, return 400
    if (!password && role && role !== 'Patient') {
      return res.status(400).json({ success: false, message: 'Password is required for non-patient users' });
    }

    // Generate a unique user_id if not provided
    let finalUserId = user_id;
    if (!finalUserId) {
      // Try a few times to generate a unique 4-digit ID
      for (let i = 0; i < 5; i++) {
        const candidate = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
        // eslint-disable-next-line no-await-in-loop
        const exists = await User.findOne({ user_id: candidate }).lean();
        if (!exists) {
          finalUserId = candidate;
          break;
        }
      }
      if (!finalUserId) finalUserId = `USR-${Date.now().toString().slice(-4)}`;
    }

    // Prepare user data
    const userData = {
      user_id: finalUserId,
      name,
      email,
      phone,
      address,
      age,
      gender,
      dob,
      role: role || 'Patient',
      password: password || undefined
    };

    // Use UserCreationService for cascade creation
    const result = await UserCreationService.createUserWithRole(userData);

    if (result.success) {
      // Remove sensitive fields before sending
      const safeUser = result.user.toObject();
      delete safeUser.password;

      const response = {
        success: true,
        data: safeUser,
        message: result.message
      };

      // Include role-specific data if created
      if (result.roleData) {
        response.roleData = result.roleData.toObject();
        response.roleCollection = UserCreationService.roleMapping[result.user.role]?.collection;
      }

      res.status(201).json(response);
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create user with role',
        error: result.message 
      });
    }

  } catch (error) {
    console.error('❌ Error creating user:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'User with that email or user_id already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation failed', error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});

/**
 * PATCH /api/users/:id - Update a user with cascade sync
 */
router.patch('/:id', async (req, res) => {
  try {
    console.log('✏️ PATCH /api/users/%s called with body:', req.params.id, req.body);
    
    // Allow updating only a safe set of fields
    const allowed = ['name', 'email', 'phone', 'address', 'age', 'gender', 'dob', 'role', 'isActive', 'isFirstLogin', 'password', 'loginAttempts', 'lockUntil'];
    const updateData = {};
    
    Object.keys(req.body || {}).forEach(key => {
      if (key === 'isLocked') return; // handle separately
      if (allowed.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Special handling for isLocked toggle from frontend
    if (Object.prototype.hasOwnProperty.call(req.body, 'isLocked')) {
      const LOCK_DURATION = 1000 * 60 * 60 * 24 * 365 * 10; // 10 years for admin-lock
      if (req.body.isLocked) {
        updateData.lockUntil = Date.now() + LOCK_DURATION;
      } else {
        updateData.lockUntil = null;
      }
    }

    // Use UserCreationService for cascade update
    const result = await UserCreationService.updateUserWithRole(req.params.id, updateData);

    if (result.success) {
      const response = {
        success: true,
        data: result.user,
        message: result.message
      };

      // Include role-specific data if updated
      if (result.roleData) {
        response.roleData = result.roleData;
      }

      res.status(200).json(response);
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user',
        error: result.message 
      });
    }

  } catch (error) {
    console.error('❌ Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation failed', error: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

/**
 * DELETE /api/users/:id - Delete a user with cascade deletion
 */
router.delete('/:id', async (req, res) => {
  try {
    // Use UserCreationService for cascade deletion
    const result = await UserCreationService.deleteUserWithRole(req.params.id);

    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: result.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user',
        error: result.message 
      });
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;
