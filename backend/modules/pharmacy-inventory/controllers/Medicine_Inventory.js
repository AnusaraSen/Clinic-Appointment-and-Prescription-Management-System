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
    console.log('[createMedicine] Incoming payload:', req.body);

    // Defensive casting / sanitization
    if (req.body.quantity !== undefined) {
      const parsedQty = Number(req.body.quantity);
      if (Number.isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a non-negative number'
        });
      }
      req.body.quantity = parsedQty;
    }
    if (req.body.reorderLevel !== undefined) {
      // Allow empty string to mean default/0
      if (req.body.reorderLevel === '') delete req.body.reorderLevel;
      else {
        const parsedReorder = Number(req.body.reorderLevel);
        if (Number.isNaN(parsedReorder) || parsedReorder < 0) {
          return res.status(400).json({
            success: false,
            message: 'Reorder level must be a non-negative number'
          });
        }
        req.body.reorderLevel = parsedReorder;
      }
    }

    // Auto-generate medicine_id if not provided using an atomic counter to avoid duplicates
    if (!req.body.medicine_id) {
      const Counter = require('../models/Counter');
      const counterDoc = await Counter.findByIdAndUpdate(
        'medicine',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      req.body.medicine_id = `MED${String(counterDoc.seq).padStart(5, '0')}`; // MED00001 style
    }

    // Trim string fields to avoid accidental whitespace-only values
    ['medicineName','genericName','strength','unit','batchNumber','dosageForm'].forEach(f => {
      if (typeof req.body[f] === 'string') {
        req.body[f] = req.body[f].trim();
      }
    });

    // Normalize optional date fields: convert empty string to undefined so Mongoose doesn't attempt cast
    ['expiryDate','manufactureDate'].forEach(f => {
      if (req.body[f] === '') delete req.body[f];
    });

    // If expiryDate provided, ensure it's a valid future (or current) date
    if (req.body.expiryDate) {
      const d = new Date(req.body.expiryDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: 'expiryDate is not a valid date' });
      }
    }

    const medicine = await Medicine.create(req.body);
    console.log('[createMedicine] Created medicine:', medicine._id, medicine.medicine_id);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    console.error('[createMedicine] Error:', error);
    // Duplicate key (retry once if due to medicine_id race)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      if (field === 'medicine_id' && !req._retried) {
        try {
          req._retried = true; // mark to avoid infinite loop
          const Counter = require('../models/Counter');
            const counterDoc = await Counter.findByIdAndUpdate(
              'medicine',
              { $inc: { seq: 1 } },
              { new: true, upsert: true }
            );
            req.body.medicine_id = `MED${String(counterDoc.seq).padStart(5, '0')}`;
            const medicine = await Medicine.create(req.body);
            return res.status(201).json({ success: true, data: medicine, retried: true });
        } catch (retryErr) {
          console.error('[createMedicine] Retry after duplicate failed:', retryErr);
        }
      }
      return res.status(400).json({ success: false, message: `Medicine with this ${field} already exists`, field });
    }
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const details = Object.entries(error.errors).map(([field, err]) => ({ field, message: err.message, kind: err.kind }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details
      });
    }
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Public
const updateMedicine = async (req, res) => {
  try {
    // Defensive sanitization similar to create
    if (req.body.quantity !== undefined) {
      const parsedQty = Number(req.body.quantity);
      if (Number.isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be a non-negative number' });
      }
      req.body.quantity = parsedQty;
    }
    if (req.body.reorderLevel !== undefined) {
      if (req.body.reorderLevel === '') delete req.body.reorderLevel;
      else {
        const parsedReorder = Number(req.body.reorderLevel);
        if (Number.isNaN(parsedReorder) || parsedReorder < 0) {
          return res.status(400).json({ success: false, message: 'Reorder level must be a non-negative number' });
        }
        req.body.reorderLevel = parsedReorder;
      }
    }
    ['expiryDate','manufactureDate'].forEach(f => {
      if (req.body[f] === '') delete req.body[f];
    });

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
