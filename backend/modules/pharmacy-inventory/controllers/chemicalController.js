const Chemical = require("../models/Chemical");

// @desc    Test route
// @route   GET /api/chemicals/test
// @access  Public
const testRoute = (req, res) => {
  res.json({
    success: true,
    message: "Chemical inventory API is working!"
  });
};

// @desc    Get all chemical inventory items
// @route   GET /api/chemicals
// @access  Public
const getChemicals = async (req, res) => {
  try {
    const { lowStock, expired } = req.query;
    let filter = {};
    
    const items = await Chemical.find(filter).sort({ createdAt: -1 });
    
    // Apply filters if requested
    let filteredItems = items;
    if (lowStock || expired) {
      filteredItems = items.filter(item => {
        const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
        const isLowStock = item.quantity <= item.reorderLevel;
        
        if (lowStock && expired) {
          return isLowStock || isExpired;
        } else if (lowStock) {
          return isLowStock;
        } else if (expired) {
          return isExpired;
        }
        return true;
      });
    }
    
    res.json({
      success: true,
      count: filteredItems.length,
      data: filteredItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single chemical inventory item
// @route   GET /api/chemicals/:id
// @access  Public
const getChemical = async (req, res) => {
  try {
    const item = await Chemical.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Chemical not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Chemical not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new chemical inventory item
// @route   POST /api/chemicals
// @access  Public
const createChemical = async (req, res) => {
  try {
    const item = await Chemical.create(req.body);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Chemical with this ${field} already exists`
      });
    }
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// @desc    Update chemical inventory item
// @route   PUT /api/chemicals/:id
// @access  Public
const updateChemical = async (req, res) => {
  try {
    const item = await Chemical.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Chemical not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Chemical with this ${field} already exists`
      });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Chemical not found'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// @desc    Delete chemical inventory item
// @route   DELETE /api/chemicals/:id
// @access  Public
const deleteChemical = async (req, res) => {
  try {
    const item = await Chemical.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Chemical not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Chemical deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Chemical not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get basic summary of chemical inventory
// @route   GET /api/chemicals/summary/basic
// @access  Public
const getChemicalSummary = async (req, res) => {
  try {
    const total = await Chemical.countDocuments();
    const items = await Chemical.find();
    
    const now = new Date();
    const expired = items.filter(item => item.expiryDate && new Date(item.expiryDate) < now).length;
    const lowStock = items.filter(item => item.quantity <= item.reorderLevel).length;
    
    res.json({
      success: true,
      data: {
        total,
        expired,
        lowStock
      }
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
  testRoute,
  getChemicals,
  getChemical,
  createChemical,
  updateChemical,
  deleteChemical,
  getChemicalSummary
};
