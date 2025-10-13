/**
 * Maintenance Scheduler Service
 * 
 * This service runs periodic checks to:
 * 1. Identify scheduled maintenance tasks that are due today
 * 2. Automatically change equipment status to "Under Maintenance"
 * 3. Send notifications to admins and assigned technicians
 * 
 * Runs every hour to check for due maintenance tasks
 */

const cron = require('node-cron');
const ScheduledMaintenance = require('../modules/workforce-facility/models/ScheduledMaintenance');
const Equipment = require('../modules/workforce-facility/models/equipments');
const notificationService = require('./notificationService');

/**
 * Check and process scheduled maintenance tasks that are due
 */
async function processDueMaintenance() {
  try {
    console.log('🔍 Checking for scheduled maintenance tasks due today...');
    
    // Get current date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get end of today
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find all scheduled maintenance tasks that are:
    // 1. Status is "Scheduled" or "Assigned"
    // 2. Scheduled date is today or past
    const dueMaintenance = await ScheduledMaintenance.find({
      status: { $in: ['Scheduled', 'Assigned'] },
      scheduled_date: { $lte: endOfDay }
    })
    .populate('equipment', 'equipment_id name status')
    .populate('assigned_technician', 'name email');
    
    console.log(`📋 Found ${dueMaintenance.length} maintenance tasks due for processing`);
    
    if (dueMaintenance.length === 0) {
      return { processed: 0, updated: 0, errors: 0 };
    }
    
    let updated = 0;
    let errors = 0;
    
    // Process each maintenance task
    for (const maintenance of dueMaintenance) {
      try {
        // Check if equipment exists and is operational
        if (!maintenance.equipment || !Array.isArray(maintenance.equipment)) {
          console.warn(`⚠️ Maintenance ${maintenance._id} has no equipment assigned`);
          continue;
        }
        
        // Update each equipment's status to "Under Maintenance"
        for (const equipmentItem of maintenance.equipment) {
          if (equipmentItem.status === 'Operational') {
            await Equipment.findByIdAndUpdate(
              equipmentItem._id,
              { 
                status: 'Under Maintenance',
                downtimeStart: new Date()
              }
            );
            
            console.log(`✅ Updated ${equipmentItem.equipment_id} status to "Under Maintenance"`);
            updated++;
          }
        }
        
        // Send notification to admins and assigned technician
        await sendMaintenanceStartNotification(maintenance);
        
      } catch (error) {
        console.error(`❌ Error processing maintenance ${maintenance._id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Maintenance check complete: ${updated} equipment updated, ${errors} errors`);
    
    return {
      processed: dueMaintenance.length,
      updated,
      errors
    };
    
  } catch (error) {
    console.error('❌ Error in processDueMaintenance:', error);
    throw error;
  }
}

/**
 * Send notification when maintenance starts (equipment goes under maintenance)
 */
async function sendMaintenanceStartNotification(maintenance) {
  try {
    // Get equipment names
    const equipmentNames = maintenance.equipment
      .map(eq => eq.name || eq.equipment_id)
      .join(', ');
    
    // Prepare notification message
    const message = `Scheduled maintenance has started for: ${equipmentNames}. Equipment status changed to "Under Maintenance".`;
    
    // Send notification using notification service
    await notificationService.notifyMaintenanceStarted(
      maintenance._id,
      equipmentNames,
      maintenance.assigned_technician
    );
    
    console.log(`📧 Sent maintenance start notification for ${equipmentNames}`);
    
  } catch (error) {
    console.error('❌ Error sending maintenance start notification:', error.message);
    // Don't throw - notification failure shouldn't stop the process
  }
}

/**
 * Initialize the maintenance scheduler
 * Runs every hour to check for due maintenance
 */
function initializeMaintenanceScheduler() {
  console.log('🚀 Initializing Maintenance Scheduler Service...');
  
  // Run immediately on startup
  processDueMaintenance()
    .then(result => {
      console.log('✅ Initial maintenance check completed:', result);
    })
    .catch(error => {
      console.error('❌ Initial maintenance check failed:', error.message);
    });
  
  // Schedule to run every hour at minute 0
  // Cron format: "0 * * * *" = at minute 0 of every hour
  const schedulerJob = cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled maintenance check...');
    try {
      const result = await processDueMaintenance();
      console.log('✅ Scheduled check completed:', result);
    } catch (error) {
      console.error('❌ Scheduled check failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Colombo" // Adjust to your timezone
  });
  
  console.log('✅ Maintenance Scheduler initialized - Running every hour');
  
  return schedulerJob;
}

/**
 * Manually trigger maintenance check (for testing or manual runs)
 */
async function manualMaintenanceCheck() {
  console.log('🔧 Manual maintenance check triggered...');
  return await processDueMaintenance();
}

module.exports = {
  initializeMaintenanceScheduler,
  processDueMaintenance,
  manualMaintenanceCheck
};
