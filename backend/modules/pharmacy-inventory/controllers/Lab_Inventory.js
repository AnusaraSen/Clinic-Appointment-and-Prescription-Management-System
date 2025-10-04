const LabInventory = require("../models/lab_inventory");

// @desc    Test endpoint
// @route   GET /api/lab-inventory/test
// @access  Public
const testEndpoint = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Lab Inventory controller is working!",
    timestamp: new Date()
  });
};

// @desc    Get all lab inventory items
// @route   GET /api/lab-inventory
// @access  Public
const getItems = async (req, res) => {
  try {
    const items = await LabInventory.find();
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single lab inventory item by ID
// @route   GET /api/lab-inventory/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await LabInventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lab inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new lab inventory item
// @route   POST /api/lab-inventory
// @access  Public
const createItem = async (req, res) => {
  try {
    const item = await LabInventory.create(req.body);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Lab item with this ${field} already exists`
      });
    }
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// @desc    Update lab inventory item
// @route   PUT /api/lab-inventory/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const item = await LabInventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lab inventory item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// @desc    Delete lab inventory item
// @route   DELETE /api/lab-inventory/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const item = await LabInventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lab inventory item not found'
      });
    }
    
    await item.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Lab inventory item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Search lab inventory items
// @route   POST /api/lab-inventory/search
// @access  Public
const searchItems = async (req, res) => {
  try {
    const { q, field = 'itemName', limit = 10 } = req.body;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchField = {};
    searchField[field] = { $regex: q, $options: 'i' };

    const items = await LabInventory.find(searchField)
      .select(`${field} lab_item_id location`)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
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
  testEndpoint,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems
};
