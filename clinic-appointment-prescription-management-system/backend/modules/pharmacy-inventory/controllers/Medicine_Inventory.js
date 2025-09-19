const Medicine = require('../models/Medicine_Inventory');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res) => {
  try {
    console.log('getMedicines called - fetching from medicine_inventory collection');
    const medicines = await Medicine.find();
    console.log('Found medicines:', medicines.length);
    console.log('Sample medicine:', medicines[0]);
    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    console.error('Error in getMedicines:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Public
const createMedicine = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    
    // Auto-generate medicine_id if not provided
    if (!req.body.medicine_id) {
      // Get the current count of medicines to generate a unique ID
      const count = await Medicine.countDocuments();
      req.body.medicine_id = `MED${String(count + 1).padStart(3, '0')}`;
    }
    
    const medicine = await Medicine.create(req.body);
    res.status(201).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Create medicine error:', error); // Debug log
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Medicine with this ${field} already exists`
      });
    }
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Public
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Public
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    await medicine.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Search medicines with autocomplete
// @route   GET /api/medicines/search
// @access  Public
const searchMedicines = async (req, res) => {
  try {
    const { q, field = 'medicineName', limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchField = {};
    searchField[field] = { $regex: q, $options: 'i' };

    const medicines = await Medicine.find(searchField)
      .select(`${field} medicine_id genericName`)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines
};
