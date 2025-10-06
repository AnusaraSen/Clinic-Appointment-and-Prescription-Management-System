const Equipment = require("../models/Equipment"); // renamed model exports InventoryEquipment

// @desc    Test route
// @route   GET /api/equipment/test
// @access  Public
const testRoute = (req, res) => {
  res.json({
    success: true,
    message: "Equipment inventory API is working!"
  });
};

// @desc    Get all equipment inventory items
// @route   GET /api/equipment
// @access  Public
const getEquipment = async (req, res) => {
  try {
    const { lowStock, needsMaintenance, outOfService } = req.query;
    let filter = {};
    
    const items = await Equipment.find(filter).sort({ createdAt: -1 });
    
    // Apply filters if requested
    let filteredItems = items;
    if (lowStock || needsMaintenance || outOfService) {
      filteredItems = items.filter(item => {
        const isLowStock = item.quantity <= item.reorderLevel;
        const needsMaintenanceCheck = item.nextMaintenanceDate && new Date(item.nextMaintenanceDate) <= new Date();
        const isOutOfService = item.condition === 'Out of Service' || item.condition === 'Needs Repair';
        
        if (lowStock && needsMaintenance && outOfService) {
          return isLowStock || needsMaintenanceCheck || isOutOfService;
        } else if (lowStock && needsMaintenance) {
          return isLowStock || needsMaintenanceCheck;
        } else if (lowStock && outOfService) {
          return isLowStock || isOutOfService;
        } else if (needsMaintenance && outOfService) {
          return needsMaintenanceCheck || isOutOfService;
        } else if (lowStock) {
          return isLowStock;
        } else if (needsMaintenance) {
          return needsMaintenanceCheck;
        } else if (outOfService) {
          return isOutOfService;
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

// @desc    Get single equipment inventory item
// @route   GET /api/equipment/:id
// @access  Public
const getSingleEquipment = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
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
        message: 'Equipment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new equipment inventory item
// @route   POST /api/equipment-inventory
// @access  Public
const createEquipment = async (req, res) => {
  try {
    // Whitelist and sanitize incoming payload to avoid cast errors
    const b = req.body || {};

    const sanitizeDate = (v) => (v ? new Date(v) : undefined);
    const sanitizeNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
    const sanitizeString = (v) => (typeof v === 'string' ? v.trim() : v);

    const payload = {
      itemName: sanitizeString(b.itemName),
      quantity: sanitizeNumber(b.quantity),
      unit: sanitizeString(b.unit),
      location: sanitizeString(b.location),
      modelNumber: sanitizeString(b.modelNumber),
      manufacturer: sanitizeString(b.manufacturer),
      calibrationDate: sanitizeDate(b.calibrationDate),
      maintenanceSchedule: sanitizeString(b.maintenanceSchedule),
      serialNumber: sanitizeString(b.serialNumber),
      purchaseDate: sanitizeDate(b.purchaseDate),
      warrantyExpiry: sanitizeDate(b.warrantyExpiry),
      reorderLevel: sanitizeNumber(b.reorderLevel),
      supplier: sanitizeString(b.supplier),
      condition: sanitizeString(b.condition) || 'Good',
      lastMaintenanceDate: sanitizeDate(b.lastMaintenanceDate),
      nextMaintenanceDate: sanitizeDate(b.nextMaintenanceDate),
      maintenanceNotes: sanitizeString(b.maintenanceNotes),
      userManual: sanitizeString(b.userManual),
      technicalSpecs: sanitizeString(b.technicalSpecs)
    };

    // Remove undefined keys so Mongoose doesn't try to cast empty values
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    // Basic required checks for clearer error than generic ValidationError
    if (!payload.itemName) return res.status(422).json({ success: false, message: 'Equipment name is required' });
    if (payload.quantity === undefined || Number.isNaN(payload.quantity)) return res.status(422).json({ success: false, message: 'Quantity must be a number' });
    if (!payload.unit) return res.status(422).json({ success: false, message: 'Unit is required' });
    if (!payload.location) return res.status(422).json({ success: false, message: 'Location is required' });

    const item = await Equipment.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ success: false, message: `Equipment with this ${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({ success: false, message: messages[0] || 'Validation error' });
    }
    return res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Update equipment inventory item
// @route   PUT /api/equipment-inventory/:id
// @access  Public
const updateEquipment = async (req, res) => {
  try {
    // Sanitize updates similar to create to avoid cast errors on empty strings
    const b = req.body || {};
    const sanitizeDate = (v) => (v ? new Date(v) : undefined);
    const sanitizeNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
    const sanitizeString = (v) => (typeof v === 'string' ? v.trim() : v);

    const updates = {
      itemName: sanitizeString(b.itemName),
      quantity: sanitizeNumber(b.quantity),
      unit: sanitizeString(b.unit),
      location: sanitizeString(b.location),
      modelNumber: sanitizeString(b.modelNumber),
      manufacturer: sanitizeString(b.manufacturer),
      calibrationDate: sanitizeDate(b.calibrationDate),
      maintenanceSchedule: sanitizeString(b.maintenanceSchedule),
      serialNumber: sanitizeString(b.serialNumber),
      purchaseDate: sanitizeDate(b.purchaseDate),
      warrantyExpiry: sanitizeDate(b.warrantyExpiry),
      reorderLevel: sanitizeNumber(b.reorderLevel),
      supplier: sanitizeString(b.supplier),
      condition: sanitizeString(b.condition),
      lastMaintenanceDate: sanitizeDate(b.lastMaintenanceDate),
      nextMaintenanceDate: sanitizeDate(b.nextMaintenanceDate),
      maintenanceNotes: sanitizeString(b.maintenanceNotes),
      userManual: sanitizeString(b.userManual),
      technicalSpecs: sanitizeString(b.technicalSpecs)
    };
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const item = await Equipment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ success: false, message: `Equipment with this ${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({ success: false, message: messages[0] || 'Validation error' });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    return res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Delete equipment inventory item
// @route   DELETE /api/equipment/:id
// @access  Public
const deleteEquipment = async (req, res) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get basic summary of equipment inventory
// @route   GET /api/equipment/summary/basic
// @access  Public
const getEquipmentSummary = async (req, res) => {
  try {
    const total = await Equipment.countDocuments();
    const items = await Equipment.find();
    
    const now = new Date();
    const needsMaintenance = items.filter(item => 
      item.nextMaintenanceDate && new Date(item.nextMaintenanceDate) <= now
    ).length;
    const lowStock = items.filter(item => item.quantity <= item.reorderLevel).length;
    const outOfService = items.filter(item => 
      item.condition === 'Out of Service' || item.condition === 'Needs Repair'
    ).length;
    
    res.json({
      success: true,
      data: {
        total,
        needsMaintenance,
        lowStock,
        outOfService
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
  getEquipment,
  getSingleEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentSummary
};
