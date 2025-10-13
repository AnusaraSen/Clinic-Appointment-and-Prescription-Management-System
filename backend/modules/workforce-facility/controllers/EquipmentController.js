const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Equipment = require('../models/equipments');
const { autoScheduleForEquipment } = require('./ScheduledMaintenanceController');

/**
 * Equipment Controller - Managing clinic equipment lifecycle! 🏥⚙️
 * 
 * This handles all equipment operations including automatic status updates
 * when maintenance requests are created or completed, and auto-scheduling
 * of preventive maintenance for new equipment.
 */

/**
 * Get all equipment with filtering and pagination 📋
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const { status, type, location, isCritical, page = 1, limit = 50 } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    if (status) searchCriteria.status = status;
    if (type) searchCriteria.type = new RegExp(type, 'i'); // Case insensitive search
    if (location) searchCriteria.location = new RegExp(location, 'i');
    if (isCritical !== undefined) searchCriteria.isCritical = isCritical === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch equipment with pagination
    const equipment = await Equipment.find(searchCriteria)
      .sort({ name: 1, equipment_id: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Equipment.countDocuments(searchCriteria);

    console.log(`✅ Found ${equipment.length} pieces of equipment (${totalCount} total)`);
    
    return res.json({
      success: true,
      message: `Found ${equipment.length} pieces of equipment`,
      data: equipment,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Special endpoint to update problematic fields (modelNumber, warrantyExpiry, notes)
 * This bypasses schema issues by using direct collection updates
 */
exports.updateEquipmentSpecialFields = async (req, res) => {
  try {
    console.log('=== SPECIAL FIELDS UPDATE ===');
    console.log('Equipment ID:', req.params.id);
    console.log('Fields to update:', JSON.stringify(req.body, null, 2));
    
    const updateFields = {};
    
    // Handle the problematic fields
    if (req.body.modelNumber !== undefined) {
      updateFields.modelNumber = req.body.modelNumber;
    }
    if (req.body.warrantyExpiry !== undefined) {
      updateFields.warrantyExpiry = req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : null;
    }
    if (req.body.notes !== undefined) {
      updateFields.notes = req.body.notes;
    }
    
    console.log('Final update fields:', JSON.stringify(updateFields, null, 2));
    
    // Use direct MongoDB collection update
    const result = await Equipment.collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Fetch the updated equipment
    const equipment = await Equipment.findById(req.params.id);
    
    return res.json({
      success: true,
      message: 'Special fields updated successfully',
      data: equipment
    });
    
  } catch (error) {
    console.error('❌ Error updating special fields:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update special fields',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all equipment with filtering and pagination 📋
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const { status, type, location, isCritical, page = 1, limit = 50 } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    if (status) searchCriteria.status = status;
    if (type) searchCriteria.type = new RegExp(type, 'i'); // Case insensitive search
    if (location) searchCriteria.location = new RegExp(location, 'i');
    if (isCritical !== undefined) searchCriteria.isCritical = isCritical === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch equipment with pagination
    const equipment = await Equipment.find(searchCriteria)
      .sort({ name: 1, equipment_id: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Equipment.countDocuments(searchCriteria);

    console.log(`✅ Found ${equipment.length} pieces of equipment (${totalCount} total)`);
    
    return res.json({
      success: true,
      message: `Found ${equipment.length} pieces of equipment`,
      data: equipment,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get equipment statistics for dashboard 📊
 */
exports.getEquipmentStats = async (req, res) => {
  try {
    const [statusStats, typeStats, criticalEquipment, recentDowntime] = await Promise.all([
      // Equipment by status
      Equipment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Equipment by type
      Equipment.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Critical equipment count
      Equipment.countDocuments({ isCritical: true }),
      
      // Recent equipment with downtime
      Equipment.find({ 
        downtimeHours: { $gt: 0 },
        status: { $in: ['Under Maintenance', 'Out of Service', 'Needs Repair'] }
      })
      .select('name location status downtimeHours lastMaintenanceDate')
      .limit(10)
      .sort({ downtimeHours: -1 })
    ]);

    const totalEquipment = await Equipment.countDocuments();
    const operationalCount = await Equipment.countDocuments({ status: 'Operational' });
    const maintenanceCount = await Equipment.countDocuments({ 
      status: 'Under Maintenance'
    });
    const outOfServiceCount = await Equipment.countDocuments({ 
      status: { $in: ['Out of Service', 'Needs Repair'] }
    });

    const stats = {
      overview: {
        totalEquipment,
        operationalCount,
        maintenanceCount,
        outOfServiceCount,
        criticalEquipment,
        operationalPercentage: totalEquipment > 0 ? Math.round((operationalCount / totalEquipment) * 100) : 0
      },
      statusBreakdown: statusStats,
      typeBreakdown: typeStats,
      recentDowntime
    };

    console.log('📊 Equipment statistics generated successfully');
    
    return res.json({
      success: true,
      message: 'Equipment statistics retrieved',
      data: stats
    });

  } catch (error) {
    console.error('❌ Error generating equipment stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate equipment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single equipment by ID 🎯
 */
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    console.log(`✅ Found equipment: ${equipment.name}`);
    
    return res.json({
      success: true,
      message: 'Equipment found',
      data: equipment
    });

  } catch (error) {
    console.error('❌ Error fetching equipment:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new equipment 🆕
 * Now includes automatic preventive maintenance scheduling!
 */
exports.createEquipment = async (req, res) => {
  try {
    console.log('=== CREATE EQUIPMENT DEBUG ===');
    console.log('Request body received:', JSON.stringify(req.body, null, 2));
    
    // Create equipment with basic required fields first
    const basicData = {
      equipment_id: req.body.equipment_id,
      name: req.body.name,
      type: req.body.type,
      location: req.body.location,
      status: req.body.status || 'Operational',
      isCritical: req.body.isCritical || false
    };
    
    // Only add maintenanceInterval if provided
    if (req.body.maintenanceInterval) {
      basicData.maintenanceInterval = req.body.maintenanceInterval;
    }
    
    const equipment = new Equipment(basicData);
    await equipment.save();
    console.log('Basic equipment created:', equipment.equipment_id);
    
    // Now update with ALL other fields using direct MongoDB update
    const updateFields = {};
    if (req.body.manufacturer) updateFields.manufacturer = req.body.manufacturer;
    if (req.body.modelNumber) updateFields.modelNumber = req.body.modelNumber;
    if (req.body.serialNumber) updateFields.serialNumber = req.body.serialNumber;
    if (req.body.purchaseDate) updateFields.purchaseDate = new Date(req.body.purchaseDate);
    if (req.body.warrantyExpiry) updateFields.warrantyExpiry = new Date(req.body.warrantyExpiry);
    if (req.body.notes) updateFields.notes = req.body.notes;
    
    console.log('Updating with fields:', JSON.stringify(updateFields, null, 2));
    
    // Use direct MongoDB update to bypass any Mongoose issues
    await Equipment.collection.updateOne(
      { _id: equipment._id },
      { $set: updateFields }
    );
    
    // Fetch the complete updated equipment
    const updatedEquipment = await Equipment.findById(equipment._id);
    console.log('Final equipment after update:', JSON.stringify(updatedEquipment.toObject(), null, 2));

    console.log(`✅ Created new equipment: ${updatedEquipment.name} (${updatedEquipment.equipment_id})`);
    
    // Auto-schedule preventive maintenance for new equipment
    // Equipment stays "Operational" - status will change automatically when maintenance date arrives
    try {
      const scheduledMaintenance = await autoScheduleForEquipment(updatedEquipment.equipment_id, 'Preventive');
      console.log(`✅ Auto-scheduled preventive maintenance for ${updatedEquipment.equipment_id} on ${scheduledMaintenance.scheduled_date.toDateString()}`);
    } catch (scheduleError) {
      console.warn(`⚠️ Failed to auto-schedule maintenance for ${updatedEquipment.equipment_id}:`, scheduleError.message);
      // Don't fail equipment creation if scheduling fails
    }
    
    return res.status(201).json({
      success: true,
      message: 'Equipment created successfully and preventive maintenance scheduled',
      data: updatedEquipment
    });

  } catch (error) {
    console.error('❌ Error creating equipment:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update equipment 🔄
 */
exports.updateEquipment = async (req, res) => {
  try {
    console.log('=== UPDATE EQUIPMENT DEBUG ===');
    console.log('Equipment ID:', req.params.id);
    console.log('Update data received:', JSON.stringify(req.body, null, 2));
    
    // Build update object with proper field handling
    const updateFields = {};
    
    // Handle all fields explicitly
    if (req.body.name !== undefined) updateFields.name = req.body.name;
    if (req.body.type !== undefined) updateFields.type = req.body.type;
    if (req.body.location !== undefined) updateFields.location = req.body.location;
    if (req.body.status !== undefined) updateFields.status = req.body.status;
    if (req.body.isCritical !== undefined) updateFields.isCritical = req.body.isCritical;
    if (req.body.manufacturer !== undefined) updateFields.manufacturer = req.body.manufacturer;
    if (req.body.modelNumber !== undefined) updateFields.modelNumber = req.body.modelNumber;
    if (req.body.serialNumber !== undefined) updateFields.serialNumber = req.body.serialNumber;
    if (req.body.maintenanceInterval !== undefined) updateFields.maintenanceInterval = req.body.maintenanceInterval;
    if (req.body.notes !== undefined) updateFields.notes = req.body.notes;
    
    // Handle date fields with proper conversion
    if (req.body.purchaseDate !== undefined) {
      updateFields.purchaseDate = req.body.purchaseDate ? new Date(req.body.purchaseDate) : null;
    }
    if (req.body.warrantyExpiry !== undefined) {
      updateFields.warrantyExpiry = req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : null;
    }
    
    console.log('Final update fields:', JSON.stringify(updateFields, null, 2));
    
    // Use direct MongoDB collection update to bypass Mongoose issues
    const result = await Equipment.collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Fetch the updated equipment using Mongoose to get proper formatting
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    console.log(`✅ Updated equipment: ${equipment.name}`);
    
    return res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });

  } catch (error) {
    console.error('❌ Error updating equipment:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update equipment status specifically 🔄
 * This is called automatically when maintenance requests are created/completed
 */
exports.updateEquipmentStatus = async (req, res) => {
  try {
    const { status, downtimeStart, downtimeEnd } = req.body;
    
    const updateData = { status };
    
    // Handle downtime calculations
    if (downtimeStart && !downtimeEnd && status !== 'Operational') {
      updateData.downtimeStart = new Date(downtimeStart);
    }
    
    if (downtimeEnd && status === 'Operational') {
      const equipment = await Equipment.findById(req.params.id);
      if (equipment && equipment.downtimeStart) {
        const downtimeHours = Math.round(
          (new Date(downtimeEnd) - equipment.downtimeStart) / (1000 * 60 * 60) * 100
        ) / 100;
        updateData.downtimeHours = (equipment.downtimeHours || 0) + downtimeHours;
        updateData.lastMaintenanceDate = new Date();
        updateData.downtimeStart = null; // Clear the start time
      }
    }
    
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    console.log(`✅ Updated equipment status: ${equipment.name} -> ${status}`);
    
    return res.json({
      success: true,
      message: 'Equipment status updated',
      data: equipment
    });

  } catch (error) {
    console.error('❌ Error updating equipment status:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update equipment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete equipment 🗑️
 */
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    console.log(`✅ Deleted equipment: ${equipment.name}`);
    
    return res.json({
      success: true,
      message: 'Equipment deleted successfully',
      data: equipment
    });

  } catch (error) {
    console.error('❌ Error deleting equipment:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * AUTOMATIC STATUS UPDATES - Called by maintenance request hooks 🔄⚙️
 */

/**
 * Auto-update equipment status when maintenance request is created
 */
exports.handleMaintenanceRequestCreated = async (equipmentIds, priority = 'Medium') => {
  try {
    if (!equipmentIds || equipmentIds.length === 0) return;
    
    // Determine new status based on priority
    let newStatus = 'Under Maintenance';
    if (priority === 'High') {
      newStatus = 'Needs Repair';
    }
    
    await Equipment.updateMany(
      { _id: { $in: equipmentIds }, status: 'Operational' },
      { 
        status: newStatus,
        downtimeStart: new Date()
      }
    );
    
    console.log(`🔄 Auto-updated ${equipmentIds.length} equipment status to "${newStatus}"`);
    
  } catch (error) {
    console.error('❌ Error auto-updating equipment status on request creation:', error);
  }
};

/**
 * Auto-update equipment status when maintenance request is completed
 */
exports.handleMaintenanceRequestCompleted = async (equipmentIds) => {
  try {
    if (!equipmentIds || equipmentIds.length === 0) return;
    
    const equipment = await Equipment.find({ _id: { $in: equipmentIds } });
    
    for (const item of equipment) {
      const updateData = { 
        status: 'Operational',
        lastMaintenanceDate: new Date()
      };
      
      // Calculate downtime if there was a start time
      if (item.downtimeStart) {
        const downtimeHours = Math.round(
          (new Date() - item.downtimeStart) / (1000 * 60 * 60) * 100
        ) / 100;
        updateData.downtimeHours = (item.downtimeHours || 0) + downtimeHours;
        updateData.downtimeStart = null;
      }
      
      await Equipment.findByIdAndUpdate(item._id, updateData);
    }
    
    console.log(`✅ Auto-updated ${equipmentIds.length} equipment to operational status`);
    
  } catch (error) {
    console.error('❌ Error auto-updating equipment status on request completion:', error);
  }
};

/**
 * Handle scheduled maintenance completion
 * Updates equipment status and schedules next preventive maintenance
 */
exports.handleScheduledMaintenanceCompleted = async (scheduledMaintenanceId) => {
  try {
    const ScheduledMaintenance = require('../models/ScheduledMaintenance');
    
    // Get the completed scheduled maintenance
    const scheduledMaintenance = await ScheduledMaintenance.findById(scheduledMaintenanceId);
    if (!scheduledMaintenance) {
      console.warn(`⚠️ Scheduled maintenance ${scheduledMaintenanceId} not found`);
      return;
    }
    
    const equipmentId = scheduledMaintenance.equipment_id;
    
    // Update equipment status based on maintenance type
    const updateData = {
      status: 'Operational', // Default to operational after maintenance
      lastMaintenanceDate: new Date()
    };
    
    // For preventive maintenance, equipment should be fully operational
    if (scheduledMaintenance.maintenance_type === 'Preventive') {
      updateData.status = 'Operational';
    }
    
    await Equipment.findOneAndUpdate(
      { equipment_id: equipmentId },
      updateData
    );
    
    console.log(`✅ Updated equipment ${equipmentId} status to ${updateData.status} after scheduled maintenance completion`);
    
    // If this was a recurring maintenance, the next occurrence is already scheduled
    // by the ScheduledMaintenanceController, so we don't need to do anything else
    
  } catch (error) {
    console.error('❌ Error handling scheduled maintenance completion:', error);
  }
};

/**
 * Schedule next preventive maintenance for equipment
 * Called when equipment needs its next maintenance scheduled
 */
exports.scheduleNextPreventiveMaintenance = async (equipmentId) => {
  try {
    const scheduledMaintenance = await autoScheduleForEquipment(equipmentId, 'Preventive');
    
    // Update equipment with next maintenance date
    await Equipment.findOneAndUpdate(
      { equipment_id: equipmentId },
      { nextScheduledMaintenance: scheduledMaintenance.scheduled_date }
    );
    
    console.log(`✅ Scheduled next preventive maintenance for ${equipmentId} on ${scheduledMaintenance.scheduled_date.toDateString()}`);
    
    return scheduledMaintenance;
    
  } catch (error) {
    console.error(`❌ Error scheduling next maintenance for ${equipmentId}:`, error);
    throw error;
  }
};

module.exports = {
  getAllEquipment: exports.getAllEquipment,
  getEquipmentStats: exports.getEquipmentStats,
  getEquipmentById: exports.getEquipmentById,
  createEquipment: exports.createEquipment,
  updateEquipment: exports.updateEquipment,
  updateEquipmentStatus: exports.updateEquipmentStatus,
  deleteEquipment: exports.deleteEquipment,
  handleMaintenanceRequestCreated: exports.handleMaintenanceRequestCreated,
  handleMaintenanceRequestCompleted: exports.handleMaintenanceRequestCompleted,
  handleScheduledMaintenanceCompleted: exports.handleScheduledMaintenanceCompleted,
  scheduleNextPreventiveMaintenance: exports.scheduleNextPreventiveMaintenance
};