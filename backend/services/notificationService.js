const Notification = require('../modules/workforce-facility/models/Notification');
const User = require('../modules/workforce-facility/models/User');

/**
 * Notification Service
 * Helper functions to create notifications from various events
 */

/**
 * Get all admin users for notification recipients
 */
const getAdminUsers = async () => {
  try {
    console.log('🔍 Fetching admin users for notification recipients...');
    const admins = await User.find({ role: 'Admin' }).select('_id role');
    console.log(`✅ Found ${admins.length} admin users`);
    return admins.map(admin => ({ user: admin._id, role: admin.role }));
  } catch (error) {
    console.error('❌ Error fetching admin users:', error);
    return [];
  }
};

/**
 * Get technician user for notification
 */
const getTechnicianRecipient = async (technicianId) => {
  try {
    const technician = await User.findOne({ _id: technicianId }).select('_id role');
    if (technician) {
      return [{ user: technician._id, role: technician.role }];
    }
    return [];
  } catch (error) {
    console.error('Error fetching technician:', error);
    return [];
  }
};

/**
 * Create notification for new maintenance request
 */
exports.notifyNewMaintenanceRequest = async (maintenanceRequest) => {
  try {
    console.log('🔔 Creating notification for new maintenance request:', maintenanceRequest.requestId || maintenanceRequest._id);
    const recipients = await getAdminUsers();
    
    if (recipients.length === 0) {
      console.log('⚠️ No admin users found - skipping notification creation');
      return;
    }

    console.log(`📧 Creating notification for ${recipients.length} admins`);
    await Notification.createNotification({
      type: 'NEW_MAINTENANCE_REQUEST',
      category: 'MAINTENANCE_REQUESTS',
      title: 'New Maintenance Request',
      message: `A new maintenance request has been created for ${maintenanceRequest.equipment?.name || 'equipment'}: ${maintenanceRequest.description.substring(0, 100)}`,
      relatedEntity: {
        entityType: 'MaintenanceRequest',
        entityId: maintenanceRequest._id
      },
      recipients,
      priority: maintenanceRequest.priority === 'High' ? 'high' : maintenanceRequest.priority === 'Critical' ? 'urgent' : 'medium',
      metadata: {
        requestId: maintenanceRequest.requestId,
        equipmentName: maintenanceRequest.equipment?.name,
        priority: maintenanceRequest.priority
      }
    });
    console.log('✅ Notification created successfully');
  } catch (error) {
    console.error('❌ Error creating new maintenance request notification:', error);
    console.error('Error details:', error.message);
  }
};

/**
 * Create notification for urgent maintenance request
 */
exports.notifyUrgentMaintenanceRequest = async (maintenanceRequest) => {
  try {
    console.log('🚨 Creating URGENT notification for maintenance request:', maintenanceRequest.requestId || maintenanceRequest._id);
    const recipients = await getAdminUsers();
    
    if (recipients.length === 0) {
      console.log('⚠️ No admin users found - skipping urgent notification creation');
      return;
    }

    console.log(`📧 Creating urgent notification for ${recipients.length} admins`);
    await Notification.createNotification({
      type: 'MAINTENANCE_REQUEST_URGENT',
      category: 'MAINTENANCE_REQUESTS',
      title: '⚠️ Urgent Maintenance Request',
      message: `URGENT: ${maintenanceRequest.equipment?.name || 'Equipment'} requires immediate attention! ${maintenanceRequest.description.substring(0, 100)}`,
      relatedEntity: {
        entityType: 'MaintenanceRequest',
        entityId: maintenanceRequest._id
      },
      recipients,
      priority: 'urgent',
      metadata: {
        requestId: maintenanceRequest.requestId,
        equipmentName: maintenanceRequest.equipment?.name,
        priority: maintenanceRequest.priority
      }
    });
    console.log('✅ Urgent notification created successfully');
  } catch (error) {
    console.error('❌ Error creating urgent maintenance request notification:', error);
    console.error('Error details:', error.message);
  }
};

/**
 * Create notification for maintenance request assignment
 */
exports.notifyMaintenanceRequestAssigned = async (maintenanceRequest, assignedTo) => {
  try {
    // Notify admins
    const adminRecipients = await getAdminUsers();
    
    // Notify technician
    const technicianRecipients = await getTechnicianRecipient(assignedTo);
    
    const allRecipients = [...adminRecipients, ...technicianRecipients];
    
    if (allRecipients.length === 0) return;

    await Notification.createNotification({
      type: 'MAINTENANCE_REQUEST_ASSIGNED',
      category: 'MAINTENANCE_REQUESTS',
      title: 'Maintenance Request Assigned',
      message: `Maintenance request for ${maintenanceRequest.equipment?.name || 'equipment'} has been assigned`,
      relatedEntity: {
        entityType: 'MaintenanceRequest',
        entityId: maintenanceRequest._id
      },
      recipients: allRecipients,
      priority: 'medium',
      metadata: {
        requestId: maintenanceRequest.requestId,
        equipmentName: maintenanceRequest.equipment?.name,
        assignedToName: assignedTo.name
      }
    });
  } catch (error) {
    console.error('Error creating maintenance request assigned notification:', error);
  }
};

/**
 * Create notification for maintenance request status update
 */
exports.notifyMaintenanceRequestStatusUpdate = async (maintenanceRequest, oldStatus, newStatus) => {
  try {
    const recipients = await getAdminUsers();
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'MAINTENANCE_REQUEST_STATUS_UPDATED',
      category: 'MAINTENANCE_REQUESTS',
      title: 'Maintenance Request Status Updated',
      message: `Request for ${maintenanceRequest.equipment?.name || 'equipment'} status changed from ${oldStatus} to ${newStatus}`,
      relatedEntity: {
        entityType: 'MaintenanceRequest',
        entityId: maintenanceRequest._id
      },
      recipients,
      priority: 'low',
      metadata: {
        requestId: maintenanceRequest.requestId,
        equipmentName: maintenanceRequest.equipment?.name,
        oldStatus,
        newStatus
      }
    });
  } catch (error) {
    console.error('Error creating maintenance request status update notification:', error);
  }
};

/**
 * Create notification for maintenance request completion
 */
exports.notifyMaintenanceRequestCompleted = async (maintenanceRequest) => {
  try {
    const recipients = await getAdminUsers();
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'MAINTENANCE_REQUEST_COMPLETED',
      category: 'MAINTENANCE_REQUESTS',
      title: '✓ Maintenance Request Completed',
      message: `Maintenance request for ${maintenanceRequest.equipment?.name || 'equipment'} has been completed successfully`,
      relatedEntity: {
        entityType: 'MaintenanceRequest',
        entityId: maintenanceRequest._id
      },
      recipients,
      priority: 'low',
      metadata: {
        requestId: maintenanceRequest.requestId,
        equipmentName: maintenanceRequest.equipment?.name,
        completedBy: maintenanceRequest.assignedTo?.name
      }
    });
  } catch (error) {
    console.error('Error creating maintenance request completed notification:', error);
  }
};

/**
 * Create notification for technician task assignment
 */
exports.notifyTechnicianAssignedToTask = async (technician, task, taskType = 'maintenance') => {
  try {
    const recipients = await getTechnicianRecipient(technician._id);
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'TECHNICIAN_ASSIGNED_TO_TASK',
      category: 'TECHNICIAN_RELATED',
      title: 'New Task Assigned',
      message: `You have been assigned a new ${taskType} task: ${task.description?.substring(0, 100) || 'Task details'}`,
      relatedEntity: {
        entityType: taskType === 'scheduled' ? 'ScheduledMaintenance' : 'MaintenanceRequest',
        entityId: task._id
      },
      recipients,
      priority: 'medium',
      metadata: {
        technicianName: technician.name,
        taskType,
        taskId: task.requestId || task._id
      }
    });
  } catch (error) {
    console.error('Error creating technician assigned notification:', error);
  }
};

/**
 * Create notification for task reassignment
 */
exports.notifyTaskReassigned = async (oldTechnician, newTechnician, task) => {
  try {
    const oldTechRecipients = await getTechnicianRecipient(oldTechnician._id);
    const newTechRecipients = await getTechnicianRecipient(newTechnician._id);
    const adminRecipients = await getAdminUsers();
    
    const allRecipients = [...oldTechRecipients, ...newTechRecipients, ...adminRecipients];
    
    if (allRecipients.length === 0) return;

    await Notification.createNotification({
      type: 'TASK_REASSIGNED',
      category: 'TECHNICIAN_RELATED',
      title: 'Task Reassigned',
      message: `Task has been reassigned from ${oldTechnician.name} to ${newTechnician.name}`,
      relatedEntity: {
        entityType: 'MaintenanceRequest',
        entityId: task._id
      },
      recipients: allRecipients,
      priority: 'medium',
      metadata: {
        oldTechnicianName: oldTechnician.name,
        newTechnicianName: newTechnician.name,
        taskId: task.requestId || task._id
      }
    });
  } catch (error) {
    console.error('Error creating task reassigned notification:', error);
  }
};

/**
 * Create notification for equipment critical status
 */
exports.notifyEquipmentCritical = async (equipment) => {
  try {
    const recipients = await getAdminUsers();
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'EQUIPMENT_STATUS_CRITICAL',
      category: 'EQUIPMENT_ISSUES',
      title: '🚨 Equipment Critical Status',
      message: `CRITICAL: ${equipment.name} status is critical and requires immediate attention!`,
      relatedEntity: {
        entityType: 'Equipment',
        entityId: equipment._id
      },
      recipients,
      priority: 'urgent',
      metadata: {
        equipmentName: equipment.name,
        equipmentId: equipment.equipmentId,
        status: equipment.status
      }
    });
  } catch (error) {
    console.error('Error creating equipment critical notification:', error);
  }
};

/**
 * Create notification for scheduled maintenance due
 */
exports.notifyScheduledMaintenanceDue = async (scheduledMaintenance) => {
  try {
    const recipients = await getAdminUsers();
    
    // Add assigned technician if exists
    if (scheduledMaintenance.assignedTechnician) {
      const techRecipients = await getTechnicianRecipient(scheduledMaintenance.assignedTechnician);
      recipients.push(...techRecipients);
    }
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'SCHEDULED_MAINTENANCE_DUE',
      category: 'SCHEDULED_MAINTENANCE',
      title: 'Scheduled Maintenance Due',
      message: `Scheduled maintenance "${scheduledMaintenance.title}" is due soon`,
      relatedEntity: {
        entityType: 'ScheduledMaintenance',
        entityId: scheduledMaintenance._id
      },
      recipients,
      priority: 'high',
      metadata: {
        maintenanceTitle: scheduledMaintenance.title,
        dueDate: scheduledMaintenance.scheduledDate
      }
    });
  } catch (error) {
    console.error('Error creating scheduled maintenance due notification:', error);
  }
};

/**
 * Create notification for scheduled maintenance overdue
 */
exports.notifyScheduledMaintenanceOverdue = async (scheduledMaintenance) => {
  try {
    const recipients = await getAdminUsers();
    
    if (scheduledMaintenance.assignedTechnician) {
      const techRecipients = await getTechnicianRecipient(scheduledMaintenance.assignedTechnician);
      recipients.push(...techRecipients);
    }
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'SCHEDULED_MAINTENANCE_OVERDUE',
      category: 'SCHEDULED_MAINTENANCE',
      title: '⚠️ Maintenance Overdue',
      message: `OVERDUE: Scheduled maintenance "${scheduledMaintenance.title}" is past due date!`,
      relatedEntity: {
        entityType: 'ScheduledMaintenance',
        entityId: scheduledMaintenance._id
      },
      recipients,
      priority: 'urgent',
      metadata: {
        maintenanceTitle: scheduledMaintenance.title,
        dueDate: scheduledMaintenance.scheduledDate
      }
    });
  } catch (error) {
    console.error('Error creating scheduled maintenance overdue notification:', error);
  }
};

/**
 * Create notification for scheduled maintenance completion
 */
exports.notifyScheduledMaintenanceCompleted = async (scheduledMaintenance) => {
  try {
    const recipients = await getAdminUsers();
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'SCHEDULED_MAINTENANCE_COMPLETED',
      category: 'SCHEDULED_MAINTENANCE',
      title: '✓ Scheduled Maintenance Completed',
      message: `Scheduled maintenance "${scheduledMaintenance.title}" has been completed`,
      relatedEntity: {
        entityType: 'ScheduledMaintenance',
        entityId: scheduledMaintenance._id
      },
      recipients,
      priority: 'low',
      metadata: {
        maintenanceTitle: scheduledMaintenance.title,
        completedBy: scheduledMaintenance.assignedTechnician?.name
      }
    });
  } catch (error) {
    console.error('Error creating scheduled maintenance completed notification:', error);
  }
};

/**
 * Create notification for new scheduled maintenance
 */
exports.notifyScheduledMaintenanceCreated = async (scheduledMaintenance) => {
  try {
    const recipients = await getAdminUsers();
    
    if (scheduledMaintenance.assignedTechnician) {
      const techRecipients = await getTechnicianRecipient(scheduledMaintenance.assignedTechnician);
      recipients.push(...techRecipients);
    }
    
    if (recipients.length === 0) return;

    await Notification.createNotification({
      type: 'SCHEDULED_MAINTENANCE_CREATED',
      category: 'SCHEDULED_MAINTENANCE',
      title: 'New Scheduled Maintenance',
      message: `New scheduled maintenance created: "${scheduledMaintenance.title}"`,
      relatedEntity: {
        entityType: 'ScheduledMaintenance',
        entityId: scheduledMaintenance._id
      },
      recipients,
      priority: 'medium',
      metadata: {
        maintenanceTitle: scheduledMaintenance.title,
        scheduledDate: scheduledMaintenance.scheduledDate
      }
    });
  } catch (error) {
    console.error('Error creating scheduled maintenance created notification:', error);
  }
};

module.exports = exports;
