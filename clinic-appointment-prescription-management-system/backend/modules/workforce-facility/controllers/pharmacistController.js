const Pharmacist = require('../models/Pharmacist');
const Prescription = require('../../clinical-workflow/models/Prescription');
// const Medicine = require('../../pharmacy-inventory/models/Medicine_Inventory'); // Commented out temporarily
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to get client IP
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '0.0.0.0';
};

// @desc    Register a new pharmacist
// @route   POST /api/pharmacist/register
// @access  Public (but should be restricted in production)
const registerPharmacist = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      licenseNumber,
      specialization,
      experienceYears,
      department,
      shift,
      role,
      permissions
    } = req.body;

    // Check if pharmacist already exists
    const existingPharmacist = await Pharmacist.findOne({
      $or: [{ email }, { licenseNumber }]
    });

    if (existingPharmacist) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacist with this email or license number already exists'
      });
    }

    // Create pharmacist
    const pharmacist = await Pharmacist.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      licenseNumber,
      specialization,
      experienceYears,
      department,
      shift,
      role,
      permissions,
      createdBy: null
    });

    // Generate JWT token
    const token = pharmacist.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Pharmacist registered successfully',
      data: {
        pharmacist: pharmacist.getSummary(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering pharmacist',
      error: error.message
    });
  }
};

// @desc    Login pharmacist
// @route   POST /api/pharmacist/login
// @access  Public
const loginPharmacist = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for pharmacist and include password
    const pharmacist = await Pharmacist.findOne({ email }).select('+password');

    if (!pharmacist) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if pharmacist is active
    if (pharmacist.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Check if password matches
    const isMatch = await pharmacist.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update login information
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent') || 'Unknown';
    await pharmacist.updateLastLogin(clientIP, userAgent);

    // Generate JWT token
    const token = pharmacist.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        pharmacist: pharmacist.getSummary(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// @desc    Get pharmacist dashboard data
// @route   GET /api/pharmacist/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // Remove authentication requirement
    // const pharmacistId = req.user.id;

    // Get prescription statistics
    const prescriptionStats = await Prescription.getStatistics();

    // Get recent prescriptions (last 10)
    const recentPrescriptions = await Prescription.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('prescriptionId patient.name prescribedBy.name status priority dateIssued totalAmount');

    // Get today's dispensed count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dispensedToday = await Prescription.countDocuments({
      status: { $in: ['Dispensed', 'Completed'] },
      dateDispensed: { $gte: today, $lt: tomorrow }
    });

    // Get low stock medicines (assuming quantity < 50 is low stock)
    let lowStockMedicines = [];
    try {
      // lowStockMedicines = await Medicine.find({
      //   quantity: { $lt: 50 },
      //   isActive: true
      // })
      // .sort({ quantity: 1 })
      // .limit(10)
      // .select('name quantity unit category manufacturer');
      
      // Temporary placeholder data for low stock medicines
      lowStockMedicines = [
        {
          _id: 'sample1',
          name: 'Paracetamol',
          quantity: 25,
          unit: 'tablets',
          category: 'Pain Relief',
          manufacturer: 'PharmaCorp'
        }
      ];
    } catch (medicineError) {
      console.log('Medicine model not available, using placeholder data');
    }

    // Get recent patients (from recent prescriptions)
    const recentPatients = await Prescription.aggregate([
      { $match: { isActive: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $group: {
          _id: '$patient.name',
          patientInfo: { $first: '$patient' },
          lastVisit: { $first: '$dateIssued' },
          totalPrescriptions: { $sum: 1 }
        }
      },
      { $limit: 10 },
      { $sort: { lastVisit: -1 } }
    ]);

    // Get pending prescriptions count by priority
    const pendingByPriority = await Prescription.aggregate([
      {
        $match: {
          status: { $in: ['New', 'Pending', 'In Progress'] },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format dashboard data
    const dashboardData = {
      statistics: {
        totalPrescriptions: prescriptionStats.total || 0,
        newPrescriptions: prescriptionStats.new || 0,
        pendingPrescriptions: prescriptionStats.pending + prescriptionStats.inProgress || 0,
        dispensedToday: dispensedToday,
        completedPrescriptions: prescriptionStats.completed || 0,
        emergencyPrescriptions: prescriptionStats.emergency || 0,
        expiredPrescriptions: prescriptionStats.expired || 0
      },
      recentPrescriptions: recentPrescriptions.map(prescription => ({
        id: prescription._id,
        prescriptionId: prescription.prescriptionId,
        patientName: prescription.patient.name,
        doctorName: prescription.prescribedBy.name,
        status: prescription.status,
        priority: prescription.priority,
        dateIssued: prescription.dateIssued,
        totalAmount: prescription.totalAmount
      })),
      lowStockMedicines: lowStockMedicines.map(medicine => ({
        id: medicine._id,
        name: medicine.name,
        quantity: medicine.quantity,
        unit: medicine.unit,
        category: medicine.category,
        manufacturer: medicine.manufacturer
      })),
      recentPatients: recentPatients.map(patient => ({
        name: patient._id,
        phone: patient.patientInfo.phone,
        lastVisit: patient.lastVisit,
        totalPrescriptions: patient.totalPrescriptions
      })),
      pendingByPriority: pendingByPriority.reduce((acc, item) => {
        acc[item._id.toLowerCase()] = item.count;
        return acc;
      }, {}),
      pharmacistInfo: {
        name: 'Dr. Sarah Johnson',
        role: 'Senior Pharmacist',
        department: 'Pharmacy',
        permissions: ['dispense', 'verify', 'inventory']
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get pharmacist profile
// @route   GET /api/pharmacist/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Mock pharmacist profile data
    const mockProfile = {
      _id: 'mock-pharmacist-id',
      fullName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      role: 'Senior Pharmacist',
      department: 'Pharmacy',
      licenseNumber: 'PHR-2023-001',
      phoneNumber: '+1-555-0123',
      dateOfBirth: '1985-03-15',
      address: '123 Medical Center Drive',
      qualifications: ['PharmD', 'Clinical Pharmacy Certificate'],
      specializations: ['Clinical Pharmacy', 'Drug Information'],
      permissions: ['dispense', 'verify', 'inventory'],
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    res.status(200).json({
      success: true,
      data: mockProfile
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update pharmacist profile
// @route   PUT /api/pharmacist/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'specialization', 'experienceYears',
      'shift', 'preferredLanguage', 'notifications', 'address', 'emergencyContact'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Mock updated profile (in real app this would update database)
    const mockUpdatedProfile = {
      _id: 'mock-pharmacist-id',
      fullName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      role: 'Senior Pharmacist',
      department: 'Pharmacy',
      licenseNumber: 'PHR-2023-001',
      phoneNumber: updates.phone || '+1-555-0123',
      address: updates.address || '123 Medical Center Drive',
      specialization: updates.specialization || 'Clinical Pharmacy',
      experienceYears: updates.experienceYears || 8,
      shift: updates.shift || 'Day',
      preferredLanguage: updates.preferredLanguage || 'English',
      notifications: updates.notifications || true,
      emergencyContact: updates.emergencyContact || 'John Johnson - +1-555-0124',
      isActive: true,
      lastModifiedBy: 'mock-pharmacist-id',
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: mockUpdatedProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Get prescriptions with filtering and pagination
// @route   GET /api/pharmacist/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    const {
      status,
      priority,
      patientName,
      doctorName,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (patientName) {
      filter['patient.name'] = { $regex: patientName, $options: 'i' };
    }

    if (doctorName) {
      filter['prescribedBy.name'] = { $regex: doctorName, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      filter.dateIssued = {};
      if (dateFrom) {
        filter.dateIssued.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.dateIssued.$lte = new Date(dateTo);
      }
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const total = await Prescription.countDocuments(filter);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const prescriptions = await Prescription.find(filter)
      .sort(sort)
      .skip(startIndex)
      .limit(parseInt(limit))
      .select('prescriptionId patient prescribedBy status priority dateIssued dateExpiry totalAmount medications.length');

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      data: prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
};

// @desc    Get prescription details
// @route   GET /api/pharmacist/prescriptions/:id
// @access  Private
const getPrescriptionDetails = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Get prescription details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription details',
      error: error.message
    });
  }
};

// @desc    Dispense medication
// @route   POST /api/pharmacist/prescriptions/:id/dispense
// @access  Private
const dispenseMedication = async (req, res) => {
  try {
    const { medicationIndex, quantityDispensed, notes, batchNumber, expiryDate } = req.body;

    if (!medicationIndex && medicationIndex !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Medication index is required'
      });
    }

    if (!quantityDispensed || quantityDispensed <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity dispensed is required'
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (prescription.status === 'Completed' || prescription.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot dispense medication for completed or cancelled prescription'
      });
    }

    // Check if prescription is expired
    if (prescription.dateExpiry && new Date() > new Date(prescription.dateExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Prescription has expired'
      });
    }

    // Dispense medication using the model method
    try {
      const mockUser = {
        _id: 'mock-pharmacist-id',
        fullName: 'Dr. Sarah Johnson',
        role: 'Senior Pharmacist'
      };
      prescription.dispenseMedication(medicationIndex, quantityDispensed, mockUser, notes);
      
      // Add additional dispensing info if provided
      if (batchNumber || expiryDate) {
        const medication = prescription.medications[medicationIndex];
        if (batchNumber) medication.dispensedBy.batchNumber = batchNumber;
        if (expiryDate) medication.dispensedBy.expiryDate = new Date(expiryDate);
      }

      await prescription.save();

      res.status(200).json({
        success: true,
        message: 'Medication dispensed successfully',
        data: prescription
      });
    } catch (dispensingError) {
      return res.status(400).json({
        success: false,
        message: dispensingError.message
      });
    }
  } catch (error) {
    console.error('Dispense medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error dispensing medication',
      error: error.message
    });
  }
};

// @desc    Update prescription status
// @route   PUT /api/pharmacist/prescriptions/:id/status
// @access  Private
const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Update status using model method
    prescription.updateStatus(
      status,
      {
        userId: 'mock-pharmacist-id',
        userName: 'Dr. Sarah Johnson',
        userRole: 'Senior Pharmacist'
      },
      notes
    );

    await prescription.save();

    res.status(200).json({
      success: true,
      message: 'Prescription status updated successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prescription status',
      error: error.message
    });
  }
};

// @desc    Logout pharmacist
// @route   POST /api/pharmacist/logout
// @access  Private
const logoutPharmacist = async (req, res) => {
  try {
    // Since we're not using authentication, just return success
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

module.exports = {
  registerPharmacist,
  loginPharmacist,
  getDashboard,
  getProfile,
  updateProfile,
  getPrescriptions,
  getPrescriptionDetails,
  dispenseMedication,
  updatePrescriptionStatus,
  logoutPharmacist
};