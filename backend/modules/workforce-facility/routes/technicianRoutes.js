/**
 * Technician Routes - Managing our maintenance heroes! 🔧
 * 
 * These routes handle technician data - crucial for assigning work orders
 * and showing who's available to fix things!
 */

const express = require('express');
const Technician = require('../models/Technician');
const router = express.Router();

/**
 * GET /api/technicians - Get all technicians 👥
 * Essential for assignment dropdowns in your maintenance forms!
 */
router.get('/', async (req, res) => {
  try {
    console.log('🔧 Getting all technicians for assignment...');
    
    const technicians = await Technician.find()
      .select('technician_id firstName lastName name email phone specialization department location contact_info availability skills isCurrentlyEmployed availabilityStatus workloadLevel experienceLevel hireDate notes emergencyContact shift') 
      .sort({ firstName: 1, lastName: 1 }); // Sort by first name, then last name
    
    // Transform data to include computed fields for frontend compatibility
    const transformedTechnicians = technicians.map(tech => {
      const techObj = tech.toObject();
      
      // Split name into firstName and lastName if they don't exist separately
      let firstName = techObj.firstName;
      let lastName = techObj.lastName;
      
      if (!firstName && !lastName && techObj.name) {
        const nameParts = techObj.name.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      return {
        ...techObj,
        employeeId: techObj.technician_id, // Map technician_id to employeeId for frontend
        fullName: techObj.name || `${firstName} ${lastName}`.trim(), // Computed full name
        firstName: firstName || '',
        lastName: lastName || '',
        // Set default values for fields the frontend expects
        email: techObj.email || '',
        department: techObj.department || 'Maintenance',
        location: techObj.location || 'Main Building',
        availabilityStatus: techObj.availability ? 'Available' : 'Unavailable',
        // Include enhanced fields
        experienceLevel: techObj.experienceLevel || 0,
        hireDate: techObj.hireDate || null,
        notes: techObj.notes || '',
        emergencyContact: techObj.emergencyContact || { name: '', phone: '', relationship: '' },
        shift: techObj.shift || ''
      };
    });
    
    console.log(`✅ Found ${transformedTechnicians.length} technicians`);
    
    res.status(200).json({
      success: true,
      count: transformedTechnicians.length,
      data: transformedTechnicians
    });
    
  } catch (error) {
    console.error('❌ Error fetching technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technicians',
      error: error.message
    });
  }
});

/**
 * GET /api/technicians/:id - Get a specific technician 🎯
 */
router.get('/:id', async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: technician
    });
    
  } catch (error) {
    console.error('❌ Error fetching technician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technician',
      error: error.message
    });
  }
});

/**
 * POST /api/technicians - Create a new technician 👨‍🔧
 */
router.post('/', async (req, res) => {
  try {
    console.log('🔧 Creating new technician...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const technicianData = {
      // Basic information
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      name: `${req.body.firstName} ${req.body.lastName}`.trim(),
      email: req.body.email,
      phone: req.body.phone,
      technician_id: req.body.employeeId || req.body.technician_id,
      
      // Employment information
      department: req.body.department,
      location: req.body.location,
      shift: req.body.shift,
      availabilityStatus: req.body.availabilityStatus || 'available',
      availability: (req.body.availabilityStatus || 'available') === 'available',
      
      // Skills and experience
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      specialization: req.body.department || (Array.isArray(req.body.skills) && req.body.skills.length > 0 ? req.body.skills[0] : ''),
      experienceLevel: req.body.experienceLevel || 0,
      hireDate: req.body.hireDate || new Date(),
      notes: req.body.notes || '',
      
      // Emergency contact information
      emergencyContact: req.body.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      
      // Legacy contact_info for backward compatibility
      contact_info: {
        email: req.body.email,
        phone: req.body.phone
      },
      
      isCurrentlyEmployed: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Prepared technician data:', JSON.stringify(technicianData, null, 2));
    
    const newTechnician = new Technician(technicianData);
    const savedTechnician = await newTechnician.save();
    
    console.log('✅ Technician created successfully:', savedTechnician._id);
    
    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      data: savedTechnician
    });
    
  } catch (error) {
    console.error('❌ Error creating technician:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
        details: error.errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Technician with this ID already exists',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create technician',
      error: error.message
    });
  }
});

/**
 * PUT /api/technicians/:id - Update a technician 📝
 */
router.put('/:id', async (req, res) => {
  try {
    console.log('🔧 Updating technician:', req.params.id);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    // Prepare the update data with all fields
    const updatedData = {
      // Basic information
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      name: `${req.body.firstName} ${req.body.lastName}`.trim(),
      email: req.body.email,
      phone: req.body.phone,
      technician_id: req.body.technician_id,
      
      // Employment information
      department: req.body.department,
      location: req.body.location,
      shift: req.body.shift,
      availabilityStatus: req.body.availabilityStatus,
      availability: req.body.availabilityStatus === 'available',
      
      // Skills and experience
      skills: req.body.skills || [],
      experienceLevel: req.body.experienceLevel,
      hireDate: req.body.hireDate,
      notes: req.body.notes,
      
      // Emergency contact information
      emergencyContact: req.body.emergencyContact || {},
      
      // Legacy contact_info for backward compatibility
      contact_info: {
        email: req.body.email,
        phone: req.body.phone
      },
      
      updatedAt: new Date()
    };

    // Remove undefined values to avoid overwriting with undefined
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });
    
    console.log('📝 Prepared update data:', JSON.stringify(updatedData, null, 2));
    
    const updatedTechnician = await Technician.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTechnician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    console.log('✅ Technician updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Technician updated successfully',
      data: updatedTechnician
    });
    
  } catch (error) {
    console.error('❌ Error updating technician:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
        details: error.errors
      });
    }
    
    // Handle cast errors (invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: error.message
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate technician ID or email',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update technician',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * DELETE /api/technicians/:id - Delete a technician 🗑️
 */
router.delete('/:id', async (req, res) => {
  try {
    console.log('🔧 Deleting technician:', req.params.id);
    
    const deletedTechnician = await Technician.findByIdAndDelete(req.params.id);
    
    if (!deletedTechnician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    console.log('✅ Technician deleted successfully');
    
    res.status(200).json({
      success: true,
      message: 'Technician deleted successfully',
      data: deletedTechnician
    });
    
  } catch (error) {
    console.error('❌ Error deleting technician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete technician',
      error: error.message
    });
  }
});

module.exports = router;
