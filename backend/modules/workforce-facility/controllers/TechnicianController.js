const Technician = require('../models/Technician');
const ScheduledMaintenance = require('../models/ScheduledMaintenance');
const mongoose = require('mongoose');

/**
 * Technician Controller - Dedicated technician management! 👨‍🔧
 * 
 * This controller handles all technician-related operations including
 * availability checking, assignment management, workload tracking,
 * and scheduling coordination. Clean separation from maintenance logic!
 */

/**
 * Get all technicians with filtering
 * Supports filtering by availability, skills, specialization
 */
const getAllTechnicians = async (req, res) => {
  try {
    const { 
      availability, 
      specialization, 
      skills, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    
    if (availability !== undefined) {
      searchCriteria.availability = availability === 'true';
    }
    
    if (specialization) {
      searchCriteria.specialization = new RegExp(specialization, 'i');
    }
    
    if (skills) {
      searchCriteria.skills = { $in: skills.split(',') };
    }
    
    // Only include currently employed technicians (simplified - just check availability)
    searchCriteria.availability = true;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch technicians
    const technicians = await Technician.find(searchCriteria)
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedRequests', 'title status')
      .populate('scheduledMaintenance', 'title scheduled_date status');
    
    const totalCount = await Technician.countDocuments(searchCriteria);
    
    res.json({
      success: true,
      message: `Found ${technicians.length} technicians`,
      data: technicians,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technicians',
      error: error.message,
      data: null
    });
  }
};

/**
 * Get technician by ID with detailed information
 */
const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const technician = await Technician.findById(id)
      .populate('assignedRequests', 'title status priority scheduled_date')
      .populate('scheduledMaintenance', 'title scheduled_date status equipment_name');
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Technician retrieved successfully',
      data: technician
    });
    
  } catch (error) {
    console.error('Error getting technician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician',
      error: error.message,
      data: null
    });
  }
};

/**
 * Get available technicians for specific date and time
 * Core function for maintenance scheduling
 */
const getAvailableTechnicians = async (req, res) => {
  try {
    const { date, time, duration, equipment_type } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time parameters are required',
        data: null
      });
    }
    
    const targetDate = new Date(date);
    const durationHours = parseFloat(duration) || 2;
    
    // Get all active technicians
    const allTechnicians = await Technician.find({
      availability: true
    });
    
    const availableTechnicians = [];
    
    for (const technician of allTechnicians) {
      // Check if technician has required skills
      if (equipment_type && !technician.hasSkillForEquipment(equipment_type)) {
        continue;
      }
      
      // Check if technician is available at the time
      if (!technician.isAvailableAtTime(targetDate, time)) {
        continue;
      }
      
      // Check if technician can accept more scheduled maintenance
      if (!technician.canAcceptScheduledMaintenance()) {
        continue;
      }
      
      // Check for scheduling conflicts
      const hasConflict = await checkSchedulingConflict(technician._id, targetDate, time, durationHours);
      if (hasConflict) {
        continue;
      }
      
      availableTechnicians.push({
        ...technician.toObject(),
        match_score: calculateMatchScore(technician, equipment_type)
      });
    }
    
    // Sort by match score (best match first)
    availableTechnicians.sort((a, b) => b.match_score - a.match_score);
    
    res.json({
      success: true,
      message: `Found ${availableTechnicians.length} available technicians for ${date} at ${time}`,
      data: availableTechnicians
    });
    
  } catch (error) {
    console.error('Error getting available technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available technicians',
      error: error.message,
      data: null
    });
  }
};

/**
 * Assign technician to scheduled maintenance
 * Handles the assignment logic with validation
 */
const assignTechnicianToMaintenance = async (req, res) => {
  try {
    const { maintenanceId } = req.params;
    const { technician_id } = req.body;
    
    // Verify scheduled maintenance exists
    const scheduledMaintenance = await ScheduledMaintenance.findById(maintenanceId);
    if (!scheduledMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled maintenance not found',
        data: null
      });
    }
    
    // Verify technician exists
    const technician = await Technician.findById(technician_id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
        data: null
      });
    }
    
    // Check if technician is available
    const isAvailable = await isAvailableForAssignment(
      technician_id,
      scheduledMaintenance.scheduled_date,
      scheduledMaintenance.scheduled_time,
      scheduledMaintenance.estimated_duration
    );
    
    if (!isAvailable.available) {
      return res.status(409).json({
        success: false,
        message: `Cannot assign ${technician.fullName}: ${isAvailable.reason}`,
        data: null
      });
    }
    
    // Update scheduled maintenance assignment
    scheduledMaintenance.assigned_technician = technician_id;
    scheduledMaintenance.assigned_technician_name = technician.fullName;
    scheduledMaintenance.status = 'Assigned';
    await scheduledMaintenance.save();
    
    // Update technician's scheduled maintenance list
    if (!technician.scheduledMaintenance.includes(maintenanceId)) {
      technician.scheduledMaintenance.push(maintenanceId);
      await technician.save();
    }
    
    res.json({
      success: true,
      message: `Maintenance assigned to ${technician.fullName}`,
      data: {
        scheduled_maintenance: scheduledMaintenance,
        assigned_technician: technician
      }
    });
    
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign technician',
      error: error.message,
      data: null
    });
  }
};

/**
 * Get technician's schedule for a specific time period
 * Shows both maintenance requests and scheduled maintenance
 */
const getTechnicianSchedule = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { startDate, endDate, month, year } = req.query;
    
    // Validate technician exists
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
        data: null
      });
    }
    
    let dateRange = {};
    
    // Handle different date range options
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateRange = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      dateRange = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      // Default to current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      dateRange = { $gte: start, $lte: end };
    }
    
    // Get scheduled maintenance
    const scheduledMaintenance = await ScheduledMaintenance.find({
      assigned_technician: technicianId,
      scheduled_date: dateRange
    }).sort({ scheduled_date: 1, scheduled_time: 1 });
    
    // Calculate workload statistics
    const workloadStats = {
      total_scheduled: scheduledMaintenance.length,
      by_status: {},
      by_priority: {},
      total_estimated_hours: 0
    };
    
    scheduledMaintenance.forEach(maintenance => {
      // Count by status
      workloadStats.by_status[maintenance.status] = 
        (workloadStats.by_status[maintenance.status] || 0) + 1;
      
      // Count by priority
      workloadStats.by_priority[maintenance.priority] = 
        (workloadStats.by_priority[maintenance.priority] || 0) + 1;
      
      // Sum estimated hours
      workloadStats.total_estimated_hours += maintenance.estimated_duration || 0;
    });
    
    res.json({
      success: true,
      message: `Retrieved schedule for ${technician.fullName}`,
      data: {
        technician: {
          id: technician._id,
          name: technician.fullName,
          email: technician.email,
          phone: technician.phone,
          specialization: technician.specialization,
          skills: technician.skills
        },
        scheduled_maintenance: scheduledMaintenance,
        workload_stats: workloadStats,
        period: month && year ? `${year}-${month.padStart(2, '0')}` : `${startDate} to ${endDate}`
      }
    });
    
  } catch (error) {
    console.error('Error getting technician schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get technician schedule',
      error: error.message,
      data: null
    });
  }
};

/**
 * Get technician workload overview
 * Useful for workload balancing
 */
const getTechnicianWorkload = async (req, res) => {
  try {
    const { period = 'current_month' } = req.query;
    
    let dateRange = {};
    const now = new Date();
    
    switch (period) {
      case 'current_week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        dateRange = { $gte: startOfWeek, $lte: endOfWeek };
        break;
      case 'current_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dateRange = { $gte: startOfMonth, $lte: endOfMonth };
        break;
      case 'next_month':
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        dateRange = { $gte: startOfNextMonth, $lte: endOfNextMonth };
        break;
    }
    
    // Get all active technicians
    const technicians = await Technician.find({
      availability: true
    });
    
    const workloadData = [];
    
    for (const technician of technicians) {
      // Get scheduled maintenance count
      const scheduledCount = await ScheduledMaintenance.countDocuments({
        assigned_technician: technician._id,
        scheduled_date: dateRange,
        status: { $nin: ['Completed', 'Cancelled'] }
      });
      
      // Calculate total estimated hours
      const scheduledMaintenance = await ScheduledMaintenance.find({
        assigned_technician: technician._id,
        scheduled_date: dateRange,
        status: { $nin: ['Completed', 'Cancelled'] }
      });
      
      const totalHours = scheduledMaintenance.reduce(
        (sum, maintenance) => sum + (maintenance.estimated_duration || 0), 
        0
      );
      
      // Calculate workload percentage (assuming 40 hours per week max)
      const maxHoursPerPeriod = period === 'current_week' ? 40 : 
                                period === 'current_month' ? 160 : 160;
      const workloadPercentage = Math.round((totalHours / maxHoursPerPeriod) * 100);
      
      workloadData.push({
        technician: {
          id: technician._id,
          name: technician.fullName,
          specialization: technician.specialization,
          skills: technician.skills
        },
        scheduled_tasks: scheduledCount,
        total_hours: totalHours,
        workload_percentage: Math.min(workloadPercentage, 100),
        capacity_status: workloadPercentage < 70 ? 'Available' : 
                        workloadPercentage < 90 ? 'Busy' : 'Overloaded'
      });
    }
    
    // Sort by workload percentage
    workloadData.sort((a, b) => a.workload_percentage - b.workload_percentage);
    
    res.json({
      success: true,
      message: `Technician workload for ${period}`,
      data: {
        period,
        technicians: workloadData,
        summary: {
          total_technicians: workloadData.length,
          available: workloadData.filter(t => t.capacity_status === 'Available').length,
          busy: workloadData.filter(t => t.capacity_status === 'Busy').length,
          overloaded: workloadData.filter(t => t.capacity_status === 'Overloaded').length
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting technician workload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get technician workload',
      error: error.message,
      data: null
    });
  }
};

/**
 * Helper function to check scheduling conflicts
 */
const checkSchedulingConflict = async (technicianId, date, time, duration) => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = hours + minutes / 60;
    const endTime = startTime + duration;
    
    // Check for conflicting scheduled maintenance
    const conflicts = await ScheduledMaintenance.find({
      assigned_technician: technicianId,
      scheduled_date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      },
      status: { $nin: ['Completed', 'Cancelled'] }
    });
    
    // Check for time conflicts
    for (const conflict of conflicts) {
      const [conflictHours, conflictMinutes] = conflict.scheduled_time.split(':').map(Number);
      const conflictStart = conflictHours + conflictMinutes / 60;
      const conflictEnd = conflictStart + conflict.estimated_duration;
      
      // Check for overlap
      if ((startTime < conflictEnd) && (endTime > conflictStart)) {
        return true; // Conflict found
      }
    }
    
    return false; // No conflicts
    
  } catch (error) {
    console.error('Error checking scheduling conflict:', error);
    return true; // Assume conflict on error for safety
  }
};

/**
 * Helper function to check if technician is available for assignment
 */
const isAvailableForAssignment = async (technicianId, date, time, duration) => {
  try {
    const technician = await Technician.findById(technicianId);
    
    if (!technician) {
      return { available: false, reason: 'Technician not found' };
    }
    
    if (!technician.availability) {
      return { available: false, reason: 'Technician is not available' };
    }
    
    if (!technician.isCurrentlyEmployed) {
      return { available: false, reason: 'Technician is no longer employed' };
    }
    
    if (!technician.canAcceptScheduledMaintenance()) {
      return { available: false, reason: 'Technician has reached maximum scheduled maintenance capacity' };
    }
    
    if (!technician.isAvailableAtTime(date, time)) {
      return { available: false, reason: 'Technician is not available at this time' };
    }
    
    const hasConflict = await checkSchedulingConflict(technicianId, date, time, duration);
    if (hasConflict) {
      return { available: false, reason: 'Technician has a scheduling conflict' };
    }
    
    return { available: true, reason: 'Available' };
    
  } catch (error) {
    console.error('Error checking technician availability:', error);
    return { available: false, reason: 'Error checking availability' };
  }
};

/**
 * Helper function to calculate match score for technician-equipment pairing
 */
const calculateMatchScore = (technician, equipmentType) => {
  let score = 50; // Base score
  
  if (!equipmentType) return score;
  
  // Exact skill match
  if (technician.skills && technician.skills.includes(equipmentType)) {
    score += 30;
  }
  
  // General repair skill
  if (technician.skills && technician.skills.includes('General Repair')) {
    score += 15;
  }
  
  // Specialization match
  if (technician.specialization && 
      technician.specialization.toLowerCase().includes(equipmentType.toLowerCase())) {
    score += 20;
  }
  
  // Lower workload gets bonus
  const currentWorkload = technician.currentWorkload.total;
  if (currentWorkload === 0) score += 10;
  else if (currentWorkload < 3) score += 5;
  
  return Math.min(score, 100);
};

module.exports = {
  getAllTechnicians,
  getTechnicianById,
  getAvailableTechnicians,
  assignTechnicianToMaintenance,
  getTechnicianSchedule,
  getTechnicianWorkload,
  // Helper functions for use by other controllers
  checkSchedulingConflict,
  isAvailableForAssignment,
  calculateMatchScore
};