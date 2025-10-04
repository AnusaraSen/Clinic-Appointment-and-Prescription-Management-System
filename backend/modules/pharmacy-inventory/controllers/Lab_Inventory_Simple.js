const LabInventory = require("../models/lab_inventory");

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
    console.log("=== LAB INVENTORY CREATE REQUEST ===");
    console.log("Request body received:", req.body);
    
    // Auto-generate unique lab_item_id if not provided
    if (!req.body.lab_item_id) {
      console.log("No lab_item_id found, generating one...");
      let isUnique = false;
      let lab_item_id;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        // Generate a more unique ID with timestamp and random components
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const randomStr = Math.random().toString(36).substr(2, 5);
        lab_item_id = `LAB-${timestamp}-${random}-${randomStr}`;
        
        // Check if this ID already exists
        const existing = await LabInventory.findOne({ lab_item_id });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        // Fallback: use mongoose ObjectId as part of the ID
        const ObjectId = require('mongoose').Types.ObjectId;
        lab_item_id = `LAB-${new ObjectId().toString()}`;
      }
      
      req.body.lab_item_id = lab_item_id;
      console.log("Generated lab_item_id:", lab_item_id);
    } else {
      console.log("lab_item_id already provided:", req.body.lab_item_id);
    }
    
    console.log('Final data for creation:', req.body);
    const item = await LabInventory.create(req.body);
    console.log('Item created successfully:', item);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Lab inventory creation error:', error);
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

// @desc    Get basic summary of lab inventory
// @route   GET /api/lab-inventory/summary/basic
// @access  Public
const getBasicSummary = async (req, res) => {
  try {
    const total = await LabInventory.countDocuments();
    const lowStock = await LabInventory.countDocuments({ quantity: { $lte: 10 } });
    const expired = await LabInventory.countDocuments({ 
      expiryDate: { $lt: new Date() } 
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        lowStock,
        expired
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
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getBasicSummary
};
