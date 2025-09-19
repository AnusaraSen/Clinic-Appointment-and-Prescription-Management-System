const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Medicine = require('../../pharmacy-inventory/models/Medicine_Inventory');

// Import pharmacist middleware for authentication
const { protect, authorizePermission } = require('../../workforce-facility/middleware/pharmacistAuth');

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.create({
      ...req.body,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create prescription'
    });
  }
};

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getAllPrescriptions = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, search, startDate, endDate } = req.query;
    
    // Build query
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { prescriptionId: { $regex: search, $options: 'i' } },
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'prescribedBy.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.dateIssued = {};
      if (startDate) query.dateIssued.$gte = new Date(startDate);
      if (endDate) query.dateIssued.$lte = new Date(endDate);
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get prescriptions with pagination
    const prescriptions = await Prescription.find(query)
      .populate('patient.patientId', 'firstName lastName phone')
      .populate('prescribedBy.doctorId', 'firstName lastName specialization')
      .populate('dispensedBy.pharmacistId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      data: prescriptions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions'
    });
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient.patientId', 'firstName lastName phone address')
      .populate('prescribedBy.doctorId', 'firstName lastName specialization licenseNumber')
      .populate('medications.medicineId', 'name manufacturer category unitPrice')
      .populate('dispensedBy.pharmacistId', 'firstName lastName')
      .populate('verifiedBy', 'firstName lastName');

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
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription'
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private
const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update prescription'
    });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private
const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if prescription can be deleted (only if not dispensed)
    if (prescription.status === 'Dispensed' || prescription.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete dispensed or completed prescription'
      });
    }

    await prescription.remove();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription'
    });
  }
};

// @desc    Dispense medicines and update prescription status
// @route   POST /api/prescriptions/:id/dispense
// @access  Private (Pharmacist)
const dispenseMedicines = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicinesDispensed, pharmacistId, pharmacistName } = req.body;

    // Find the prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if prescription is already fully dispensed
    if (prescription.status === 'Dispensed' || prescription.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Prescription is already dispensed'
      });
    }

    // Check if prescription has expired
    if (prescription.dateExpiry && new Date(prescription.dateExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Prescription has expired and cannot be dispensed'
      });
    }

    // Validate input data
    if (!medicinesDispensed || !Array.isArray(medicinesDispensed) || medicinesDispensed.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No medicines specified for dispensing'
      });
    }

    if (!pharmacistId || !pharmacistName) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacist information is required'
      });
    }

    // Track updated medicines for inventory reduction
    const inventoryUpdates = [];
    const medicineUpdates = [];

    // Process each dispensed medicine
    for (const dispensedMedicine of medicinesDispensed) {
      const { medicineName, quantityDispensed } = dispensedMedicine;

      // Find the medicine in the prescription
      const medicationIndex = prescription.medications.findIndex(
        med => med.medicineName === medicineName
      );

      if (medicationIndex === -1) {
        return res.status(400).json({
          success: false,
          message: `Medicine ${medicineName} not found in prescription`
        });
      }

      const medication = prescription.medications[medicationIndex];

      // Check if we can dispense the requested quantity
      const remainingToDispense = medication.quantityPrescribed - (medication.quantityDispensed || 0);
      if (quantityDispensed > remainingToDispense) {
        return res.status(400).json({
          success: false,
          message: `Cannot dispense ${quantityDispensed} of ${medicineName}. Only ${remainingToDispense} remaining.`
        });
      }

      // Find the medicine in inventory
      const medicineInInventory = await Medicine.findOne({ 
        medicineName: { $regex: new RegExp(medicineName, 'i') }
      });

      if (!medicineInInventory) {
        return res.status(404).json({
          success: false,
          message: `Medicine ${medicineName} not found in inventory`
        });
      }

      // Check if enough stock is available
      if (medicineInInventory.quantity < quantityDispensed) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicineName}. Available: ${medicineInInventory.quantity}, Required: ${quantityDispensed}`
        });
      }

      // Prepare inventory update
      inventoryUpdates.push({
        medicineId: medicineInInventory._id,
        quantityToReduce: quantityDispensed,
        currentQuantity: medicineInInventory.quantity
      });

      // Update medication in prescription
      medication.quantityDispensed = (medication.quantityDispensed || 0) + quantityDispensed;
      medication.dispensedBy = {
        pharmacistId,
        pharmacistName,
        dispensedAt: new Date()
      };

      medicineUpdates.push({
        medicationIndex,
        newQuantityDispensed: medication.quantityDispensed,
        isFullyDispensed: medication.quantityDispensed >= medication.quantityPrescribed
      });
    }

    // Update medicine inventory quantities
    for (const update of inventoryUpdates) {
      await Medicine.findByIdAndUpdate(
        update.medicineId,
        { $inc: { quantity: -update.quantityToReduce } },
        { new: true }
      );
    }

    // Update prescription status
    const allMedicationsFullyDispensed = prescription.medications.every(med => {
      const updateInfo = medicineUpdates.find(update => 
        prescription.medications[update.medicationIndex].medicineName === med.medicineName
      );
      if (updateInfo) {
        return updateInfo.isFullyDispensed;
      }
      return (med.quantityDispensed || 0) >= med.quantityPrescribed;
    });

    const anyMedicationDispensed = prescription.medications.some(med => {
      const updateInfo = medicineUpdates.find(update => 
        prescription.medications[update.medicationIndex].medicineName === med.medicineName
      );
      if (updateInfo) {
        return med.quantityDispensed > 0 || updateInfo.newQuantityDispensed > 0;
      }
      return (med.quantityDispensed || 0) > 0;
    });

    if (allMedicationsFullyDispensed) {
      prescription.status = 'Dispensed';
      prescription.dateDispensed = new Date();
    } else if (anyMedicationDispensed) {
      prescription.status = 'Partially Dispensed';
    }

    // Save the updated prescription
    await prescription.save();

    res.status(200).json({
      success: true,
      message: 'Medicines dispensed successfully',
      data: {
        prescription,
        inventoryUpdates: inventoryUpdates.length,
        medicinesDispensed: medicinesDispensed.length
      }
    });
  } catch (error) {
    console.error('Dispense medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispense medicines',
      error: error.message
    });
  }
};

// @desc    Get prescription statistics
// @route   GET /api/prescriptions/stats
// @access  Private
const getPrescriptionStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Promise.all([
      // Total prescriptions
      Prescription.countDocuments(),
      
      // New prescriptions
      Prescription.countDocuments({ status: 'New' }),
      
      // Pending prescriptions
      Prescription.countDocuments({ status: { $in: ['Pending', 'Approved'] } }),
      
      // Dispensed today
      Prescription.countDocuments({
        status: 'Dispensed',
        'dispensedBy.dispensedAt': { $gte: today, $lt: tomorrow }
      }),
      
      // Expired prescriptions
      Prescription.countDocuments({
        dateExpiry: { $lt: new Date() },
        status: { $nin: ['Completed', 'Cancelled'] }
      }),
      
      // Urgent prescriptions
      Prescription.countDocuments({
        $or: [
          { priority: 'Emergency' },
          { isUrgent: true }
        ],
        status: { $nin: ['Completed', 'Cancelled'] }
      })
    ]);

    // Status distribution
    const statusDistribution = await Prescription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority distribution
    const priorityDistribution = await Prescription.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly prescription trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Prescription.aggregate([
      {
        $match: {
          dateIssued: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateIssued' },
            month: { $month: '$dateIssued' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: stats[0],
          new: stats[1],
          pending: stats[2],
          dispensedToday: stats[3],
          expired: stats[4],
          urgent: stats[5]
        },
        distributions: {
          status: statusDistribution,
          priority: priorityDistribution
        },
        trends: {
          monthly: monthlyTrend
        }
      }
    });
  } catch (error) {
    console.error('Get prescription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription statistics'
    });
  }
};

// Routes
router.use(protect); // All routes require authentication

// Statistics route
router.get('/stats', authorizePermission('canViewPrescriptions'), getPrescriptionStats);

// Dispensing route
router.post('/:id/dispense', authorizePermission('canViewPrescriptions'), dispenseMedicines);

// CRUD routes  
router.post('/', authorizePermission('canViewPrescriptions'), createPrescription);
router.get('/', authorizePermission('canViewPrescriptions'), getAllPrescriptions);
router.get('/:id', authorizePermission('canViewPrescriptions'), getPrescriptionById);
router.put('/:id', authorizePermission('canViewPrescriptions'), updatePrescription);
router.delete('/:id', authorizePermission('canViewPrescriptions'), deletePrescription);

module.exports = router;