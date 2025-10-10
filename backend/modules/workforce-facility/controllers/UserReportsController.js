/**
 * User Reports Controller
 * Handles analytics and reporting for user management
 */

const User = require('../models/User');
const mongoose = require('mongoose');
const LoginEvent = require('../../auth/models/LoginEvent');

/**
 * Get user metrics for dashboard KPIs
 * GET /api/users/reports/metrics
 */
exports.getReportMetrics = async (req, res) => {
  try {
    const { startDate, endDate, role, status } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        // Set to end of day to include all users created on the end date
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endOfDay;
      }
    }

    // Build role filter
    const roleFilter = role && role !== 'all' ? { role } : {};

    // Build status filter
    const statusFilter = {};
    if (status === 'active') {
      statusFilter.isActive = true;
      statusFilter.$or = [
        { lockUntil: { $exists: false } },
        { lockUntil: null },
        { lockUntil: { $lt: new Date() } }
      ];
    } else if (status === 'locked') {
      statusFilter.lockUntil = { $gt: new Date() };
    } else if (status === 'inactive') {
      statusFilter.isActive = false;
    }

    const baseFilter = { ...dateFilter, ...roleFilter, ...statusFilter };

    // Total users count
    const totalUsers = await User.countDocuments(baseFilter);

    // Active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      ...baseFilter,
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      ...baseFilter,
      createdAt: { $gte: startOfMonth }
    });

    // Locked accounts
    const lockedAccounts = await User.countDocuments({
      ...baseFilter,
      lockUntil: { $gt: new Date() }
    });

    // Role distribution - get top role
    const roleDistribution = await User.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topRole = roleDistribution.length > 0 
      ? { role: roleDistribution[0]._id, count: roleDistribution[0].count }
      : { role: 'N/A', count: 0 };

    // Activity rate (percentage of users who logged in last 30 days)
    const activityRate = totalUsers > 0 
      ? Math.round((activeUsers / totalUsers) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        lockedAccounts,
        topRole,
        activityRate
      }
    });

  } catch (error) {
    console.error('Error getting user metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user metrics',
      error: error.message
    });
  }
};

/**
 * Get role distribution
 * GET /api/users/reports/role-distribution
 */
exports.getRoleDistribution = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    // Build filters
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const statusFilter = {};
    if (status === 'active') {
      statusFilter.isActive = true;
      statusFilter.$or = [
        { lockUntil: { $exists: false } },
        { lockUntil: null },
        { lockUntil: { $lt: new Date() } }
      ];
    } else if (status === 'locked') {
      statusFilter.lockUntil = { $gt: new Date() };
    } else if (status === 'inactive') {
      statusFilter.isActive = false;
    }

    const baseFilter = { ...dateFilter, ...statusFilter };

    // Get total for percentage calculation
    const total = await User.countDocuments(baseFilter);

    // Aggregate by role
    const distribution = await User.aggregate([
      { $match: baseFilter },
      { 
        $group: { 
          _id: '$role', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Add percentage
    const result = distribution.map(item => ({
      role: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting role distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role distribution',
      error: error.message
    });
  }
};

/**
 * Get user registration trend (monthly)
 * GET /api/users/reports/registration-trend
 */
exports.getRegistrationTrend = async (req, res) => {
  try {
    const { startDate, endDate, role } = req.query;

    // Default to last 12 months if no date range specified
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 12));
    const end = endDate ? new Date(endDate) : new Date();
    
    // Set end date to end of day to include all registrations on that date
    if (endDate) {
      end.setHours(23, 59, 59, 999);
    }

    // Build filters
    const matchFilter = {
      createdAt: { $gte: start, $lte: end }
    };
    if (role && role !== 'all') {
      matchFilter.role = role;
    }

    const trend = await User.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format results
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = trend.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting registration trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration trend',
      error: error.message
    });
  }
};

/**
 * Get user activity data (top active users)
 * GET /api/users/reports/activity
 */
exports.getActivityData = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate, role } = req.query;

    // Build filters
    const matchFilter = {
      lastLogin: { $exists: true, $ne: null }
    };

    if (startDate || endDate) {
      matchFilter.lastLogin = {};
      if (startDate) matchFilter.lastLogin.$gte = new Date(startDate);
      if (endDate) matchFilter.lastLogin.$lte = new Date(endDate);
    }

    if (role && role !== 'all') {
      matchFilter.role = role;
    }

    // Get users sorted by last login (most recent)
    const users = await User.find(matchFilter)
      .select('user_id name email role lastLogin loginAttempts')
      .sort({ lastLogin: -1 })
      .limit(parseInt(limit));

    // Calculate days since last login
    const result = users.map(user => {
      const daysSinceLogin = user.lastLogin 
        ? Math.floor((new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24))
        : null;

      return {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        daysSinceLogin,
        loginAttempts: user.loginAttempts || 0
      };
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting activity data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity data',
      error: error.message
    });
  }
};

/**
 * Get raw login events for reporting
 * GET /api/users/reports/login-events?startDate=&endDate=&role=
 */
exports.getLoginEvents = async (req, res) => {
  try {
    const { startDate, endDate, role } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) {
        // Set to end of day to include all events on the end date
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        match.timestamp.$lte = endOfDay;
      }
    }

    // If role filter provided, join with users
    if (role && role !== 'all') {
      const events = await LoginEvent.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDoc'
          }
        },
        { $unwind: '$userDoc' },
        { $match: { 'userDoc.role': role } },
        { $project: { user_id: 1, timestamp: 1 } },
        { $sort: { timestamp: 1 } }
      ]);

      return res.status(200).json({ success: true, data: events });
    }

    const events = await LoginEvent.find(match).select('user_id timestamp -_id').sort({ timestamp: 1 }).lean();

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Error getting login events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch login events', error: error.message });
  }
};

/**
 * Export individual user data
 * GET /api/users/:userId/export
 */
exports.exportUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by user_id or _id
    const user = await User.findOne({
      $or: [
        { user_id: userId },
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ]
    }).select('-password -refreshToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch role-specific data to get additional details like phone
    let phoneNumber = user.phone || 'N/A';
    let roleSpecificData = {};

    try {
      switch (user.role) {
        case 'Technician': {
          const Technician = require('../models/Technician');
          const techData = await Technician.findOne({ user: user._id }).select('phone email specialization skills').lean();
          if (techData) {
            phoneNumber = techData.phone || phoneNumber;
            roleSpecificData = {
              specialization: techData.specialization,
              skills: techData.skills
            };
          }
          break;
        }
        case 'Doctor': {
          const Doctor = require('../models/Doctor');
          const docData = await Doctor.findOne({ user: user._id }).select('officePhone licenseNumber specialty').lean();
          if (docData) {
            phoneNumber = docData.officePhone || phoneNumber;
            roleSpecificData = {
              licenseNumber: docData.licenseNumber,
              specialty: docData.specialty
            };
          }
          break;
        }
        case 'LabSupervisor': {
          const LabSupervisor = require('../models/LabSupervisor');
          const labSupData = await LabSupervisor.findOne({ user: user._id }).select('officePhone department').lean();
          if (labSupData) {
            phoneNumber = labSupData.officePhone || phoneNumber;
            roleSpecificData = {
              department: labSupData.department
            };
          }
          break;
        }
        case 'LabStaff': {
          const LabStaff = require('../models/LabStaff');
          const labStaffData = await LabStaff.findOne({ user: user._id }).select('position department shift extension').lean();
          if (labStaffData) {
            roleSpecificData = {
              position: labStaffData.position,
              department: labStaffData.department,
              shift: labStaffData.shift,
              extension: labStaffData.extension
            };
          }
          break;
        }
        case 'InventoryManager': {
          const InventoryManager = require('../models/InventoryManager');
          const invData = await InventoryManager.findOne({ user: user._id }).select('officePhone department').lean();
          if (invData) {
            phoneNumber = invData.officePhone || phoneNumber;
            roleSpecificData = {
              department: invData.department
            };
          }
          break;
        }
        case 'Pharmacist': {
          const Pharmacist = require('../models/Pharmacist');
          const pharData = await Pharmacist.findOne({ user: user._id }).select('licenseNumber shift extension').lean();
          if (pharData) {
            roleSpecificData = {
              licenseNumber: pharData.licenseNumber,
              shift: pharData.shift,
              extension: pharData.extension
            };
          }
          break;
        }
        case 'Patient': {
          const Patient = require('../models/Patient');
          const patData = await Patient.findOne({ user: user._id }).select('phone bloodType emergencyContact').lean();
          if (patData) {
            phoneNumber = patData.phone || phoneNumber;
            roleSpecificData = {
              bloodType: patData.bloodType,
              emergencyContact: patData.emergencyContact
            };
          }
          break;
        }
        case 'Admin': {
          const Administrator = require('../models/Administrator');
          const adminData = await Administrator.findOne({ user: user._id }).select('officePhone department').lean();
          if (adminData) {
            phoneNumber = adminData.officePhone || phoneNumber;
            roleSpecificData = {
              department: adminData.department
            };
          }
          break;
        }
      }
    } catch (roleError) {
      console.warn(`Could not fetch role-specific data for ${user.role}:`, roleError.message);
      // Continue with base user data
    }

    // Prepare export data
    const exportData = {
      userId: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: phoneNumber,
      age: user.age || 'N/A',
      gender: user.gender || 'N/A',
      address: user.address || 'N/A',
      status: user.isActive ? 'Active' : 'Inactive',
      isLocked: user.isLocked ? 'Yes' : 'No',
      registrationDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      loginAttempts: user.loginAttempts || 0,
      accountAge: user.createdAt 
        ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
        : 'N/A',
      ...roleSpecificData
    };

    res.status(200).json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: error.message
    });
  }
};

/**
 * Export filtered user data to Excel
 * POST /api/users/reports/export-filtered
 */
exports.exportFilteredUsers = async (req, res) => {
  try {
    const { startDate, endDate, role, status, lastLogin } = req.body;

    // Build query filters
    const query = {};

    // Date filter for user creation
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
      query.$or = [
        { lockUntil: { $exists: false } },
        { lockUntil: null },
        { lockUntil: { $lt: new Date() } }
      ];
    } else if (status === 'locked') {
      query.lockUntil = { $gt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Last login filter (optional)
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin);
      const endOfLoginDay = new Date(lastLogin);
      endOfLoginDay.setHours(23, 59, 59, 999);
      query.lastLogin = { $gte: lastLoginDate, $lte: endOfLoginDay };
    }

    // Fetch users with filters
    const users = await User.find(query)
      .select('user_id name email role phone isActive lastLogin loginAttempts createdAt lockUntil')
      .sort({ createdAt: -1 })
      .lean();

    // Import ExcelJS
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Report');

    // Define columns
    worksheet.columns = [
      { header: 'User ID', key: 'user_id', width: 12 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Last Login', key: 'lastLogin', width: 20 },
      { header: 'Login Attempts', key: 'loginAttempts', width: 15 },
      { header: 'Registration Date', key: 'createdAt', width: 20 },
      { header: 'Account Age (days)', key: 'accountAge', width: 18 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Fetch role-specific data for phone numbers
    const Technician = require('../models/Technician');
    const Doctor = require('../models/Doctor');
    const LabSupervisor = require('../models/LabSupervisor');
    const InventoryManager = require('../models/InventoryManager');
    const Administrator = require('../models/Administrator');
    const Patient = require('../models/Patient');
    const Pharmacist = require('../models/Pharmacist');
    const LabStaff = require('../models/LabStaff');

    // Add data rows
    for (const user of users) {
      let phone = user.phone || 'N/A';
      
      // Fetch phone from role-specific collection
      try {
        let roleDoc = null;
        switch (user.role) {
          case 'Technician':
            roleDoc = await Technician.findOne({ user_id: user.user_id }).select('phone').lean();
            phone = roleDoc?.phone || phone;
            break;
          case 'Doctor':
            roleDoc = await Doctor.findOne({ user_id: user.user_id }).select('officePhone').lean();
            phone = roleDoc?.officePhone || phone;
            break;
          case 'LabSupervisor':
            roleDoc = await LabSupervisor.findOne({ user_id: user.user_id }).select('phone').lean();
            phone = roleDoc?.phone || phone;
            break;
          case 'InventoryManager':
            roleDoc = await InventoryManager.findOne({ user_id: user.user_id }).select('phone').lean();
            phone = roleDoc?.phone || phone;
            break;
          case 'Administrator':
            roleDoc = await Administrator.findOne({ user_id: user.user_id }).select('phone').lean();
            phone = roleDoc?.phone || phone;
            break;
          case 'Patient':
            roleDoc = await Patient.findOne({ user_id: user.user_id }).select('phone').lean();
            phone = roleDoc?.phone || phone;
            break;
          case 'Pharmacist':
            roleDoc = await Pharmacist.findOne({ user_id: user.user_id }).select('phone extension').lean();
            phone = roleDoc?.phone || roleDoc?.extension || phone;
            break;
          case 'LabStaff':
            roleDoc = await LabStaff.findOne({ user_id: user.user_id }).select('phone').lean();
            phone = roleDoc?.phone || phone;
            break;
        }
      } catch (err) {
        console.warn(`Failed to fetch role-specific data for ${user.user_id}:`, err.message);
      }

      // Determine status
      let status = 'Active';
      if (user.lockUntil && user.lockUntil > new Date()) {
        status = 'Locked';
      } else if (user.isActive === false) {
        status = 'Inactive';
      }

      // Calculate account age
      const accountAge = user.createdAt 
        ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
        : 'N/A';

      worksheet.addRow({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: phone,
        status: status,
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        loginAttempts: user.loginAttempts || 0,
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A',
        accountAge: accountAge === 'N/A' ? accountAge : `${accountAge} days`
      });
    }

    // Add summary section at the bottom
    worksheet.addRow([]);
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow(['SUMMARY', '', '', '', '', '', '', '', '', '', '']);
    summaryRow.font = { bold: true, size: 12 };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };

    worksheet.addRow(['Total Users', users.length]);
    worksheet.addRow(['Active Users', users.filter(u => !u.lockUntil || u.lockUntil < new Date()).length]);
    worksheet.addRow(['Locked Users', users.filter(u => u.lockUntil && u.lockUntil > new Date()).length]);
    
    // Add filter information
    worksheet.addRow([]);
    worksheet.addRow(['FILTERS APPLIED', '', '', '', '', '', '', '', '', '', '']);
    if (startDate) worksheet.addRow(['Start Date', new Date(startDate).toLocaleDateString()]);
    if (endDate) worksheet.addRow(['End Date', new Date(endDate).toLocaleDateString()]);
    if (role && role !== 'all') worksheet.addRow(['Role', role]);
    if (status) worksheet.addRow(['Status', status]);
    if (lastLogin) worksheet.addRow(['Last Login', new Date(lastLogin).toLocaleDateString()]);

    // Generate Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=user_report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting filtered users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user report',
      error: error.message
    });
  }
};
