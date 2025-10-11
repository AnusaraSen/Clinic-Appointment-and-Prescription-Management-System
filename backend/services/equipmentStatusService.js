const Equipment = require('../modules/workforce-facility/models/equipments');
const ScheduledMaintenance = require('../modules/workforce-facility/models/ScheduledMaintenance');
const MaintenanceRequest = require('../modules/workforce-facility/models/MaintenanceRequests');
const cron = require('node-cron');

/**
 * Equipment Status Service
 * 
 * Automatically manages equipment status based on maintenance schedules and requests:
 * - When maintenance is scheduled for today → status becomes "Under Maintenance"
 * - When maintenance is completed → status returns to "Operational"
 */

/**
 * Update equipment status to "Under Maintenance" when scheduled date arrives
 */
const updateEquipmentStatusForScheduledMaintenance = async (maintenanceId) => {
  try {
    const maintenance = await ScheduledMaintenance.findById(maintenanceId)
      .populate('equipment_id');
    
    if (!maintenance || !maintenance.equipment_id) {
      console.log('Maintenance or equipment not found');
      return;
    }

    // Update equipment status to "Under Maintenance"
    await Equipment.findByIdAndUpdate(
      maintenance.equipment_id._id,
      { 
        status: 'Under Maintenance',
        lastMaintenance: new Date()
      },
      { new: true }
    );

    console.log(`✅ Equipment ${maintenance.equipment_id.equipment_id} status updated to "Under Maintenance"`);
  } catch (error) {
    console.error('Error updating equipment status for scheduled maintenance:', error);
  }
};

/**
 * Update equipment status to "Operational" when maintenance is completed
 */
const updateEquipmentStatusOnMaintenanceCompletion = async (equipmentId) => {
  try {
    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      console.log('Equipment not found');
      return;
    }

    // Update equipment status to "Operational"
    await Equipment.findByIdAndUpdate(
      equipmentId,
      { 
        status: 'Operational',
        lastMaintenance: new Date()
      },
      { new: true }
    );

    console.log(`✅ Equipment ${equipment.equipment_id} status updated to "Operational"`);
  } catch (error) {
    console.error('Error updating equipment status on completion:', error);
  }
};

/**
 * Check all scheduled maintenance for today and update equipment status
 * This runs automatically every hour
 */
const checkTodaysMaintenanceSchedules = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all maintenance scheduled for today that's not completed
    const todaysMaintenance = await ScheduledMaintenance.find({
      scheduled_date: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $in: ['Scheduled', 'Assigned', 'In Progress'] }
    }).populate('equipment_id');

    console.log(`🔍 Found ${todaysMaintenance.length} maintenance schedules for today`);

    // Update equipment status for each scheduled maintenance
    for (const maintenance of todaysMaintenance) {
      if (maintenance.equipment_id) {
        const equipment = await Equipment.findById(maintenance.equipment_id._id);
        
        // Only update if not already under maintenance
        if (equipment && equipment.status !== 'Under Maintenance') {
          await Equipment.findByIdAndUpdate(
            equipment._id,
            { status: 'Under Maintenance' },
            { new: true }
          );
          
          console.log(`✅ Updated equipment ${equipment.equipment_id} to "Under Maintenance"`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking today\'s maintenance schedules:', error);
  }
};

/**
 * Initialize the automatic equipment status checker
 * Runs every hour to check for scheduled maintenance
 */
const initializeEquipmentStatusChecker = () => {
  // Run immediately on startup
  checkTodaysMaintenanceSchedules();
  
  // Schedule to run every hour
  cron.schedule('0 * * * *', () => {
    console.log('🔄 Running scheduled equipment status check...');
    checkTodaysMaintenanceSchedules();
  });
  
  console.log('✅ Equipment status checker initialized - will run every hour');
};

/**
 * Manually trigger equipment status update for a specific maintenance schedule
 */
const triggerStatusUpdateForSchedule = async (scheduleId) => {
  try {
    const maintenance = await ScheduledMaintenance.findById(scheduleId)
      .populate('equipment_id');
    
    if (!maintenance || !maintenance.equipment_id) {
      return { success: false, message: 'Maintenance or equipment not found' };
    }

    // Check if maintenance is today or in progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scheduleDate = new Date(maintenance.scheduled_date);
    scheduleDate.setHours(0, 0, 0, 0);
    
    const isToday = scheduleDate.getTime() === today.getTime();
    const isInProgress = maintenance.status === 'In Progress';
    
    if (isToday || isInProgress) {
      await Equipment.findByIdAndUpdate(
        maintenance.equipment_id._id,
        { status: 'Under Maintenance' },
        { new: true }
      );
      
      return { 
        success: true, 
        message: `Equipment ${maintenance.equipment_id.equipment_id} status updated to "Under Maintenance"` 
      };
    }
    
    return { 
      success: false, 
      message: 'Maintenance is not scheduled for today or in progress' 
    };
  } catch (error) {
    console.error('Error triggering status update:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  updateEquipmentStatusForScheduledMaintenance,
  updateEquipmentStatusOnMaintenanceCompletion,
  checkTodaysMaintenanceSchedules,
  initializeEquipmentStatusChecker,
  triggerStatusUpdateForSchedule
};
