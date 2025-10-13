# Maintenance Notifications Guide

## Overview
This document describes all notification instances that occur in the maintenance section of the admin dashboard, including when they are triggered, who receives them, and their priority levels.

---

## Notification Types

### 1. Scheduled Maintenance Notifications

#### 1.1 New Scheduled Maintenance Created
- **Type**: `SCHEDULED_MAINTENANCE_CREATED`
- **Category**: `SCHEDULED_MAINTENANCE`
- **When**: Immediately after a new scheduled maintenance task is created
- **Triggered By**: `POST /api/scheduled-maintenance` endpoint
- **File**: `backend/modules/workforce-facility/controllers/ScheduledMaintenanceController.js` (line ~278)
- **Recipients**: 
  - All Admin users
  - Assigned technician (if one is assigned at creation)
- **Priority**: `medium`
- **Message Format**: `"New scheduled maintenance created: [Title]"`

#### 1.2 Technician Assigned to Scheduled Maintenance
- **Type**: `TECHNICIAN_ASSIGNED_TO_TASK`
- **Category**: `TECHNICIAN_RELATED`
- **When**: When a technician is assigned to a scheduled maintenance task
- **Triggered By**: `POST /api/technicians/:maintenanceId/assign` endpoint
- **File**: `backend/modules/workforce-facility/controllers/TechnicianController.js` (line ~245)
- **Recipients**:
  - The assigned technician
  - All Admin users
- **Priority**: `medium`
- **Message Format**: `"You have been assigned a new scheduled task: [Description]"`

#### 1.3 Scheduled Maintenance Status Updated
- **Type**: `SCHEDULED_MAINTENANCE_STATUS_UPDATED`
- **Category**: `SCHEDULED_MAINTENANCE`
- **When**: When a technician or admin changes the status of a scheduled maintenance task
- **Triggered By**: `PUT /api/scheduled-maintenance/:id/status` endpoint
- **File**: `backend/modules/workforce-facility/controllers/ScheduledMaintenanceController.js` (line ~520-530)
- **Recipients**:
  - All Admin users
  - Assigned technician
- **Priority**: 
  - `medium` for "In Progress" and "Rescheduled"
  - `low` for "Cancelled"
- **Message Format**: `"Scheduled maintenance '[Title]' status changed to '[Status]' by [Technician Name]"`
- **Status Triggers**:
  - ✅ **In Progress**: When technician starts working (icon: 🔧)
  - ✅ **Cancelled**: When task is cancelled (icon: ❌)
  - ✅ **Rescheduled**: When task is rescheduled (icon: 📅)

#### 1.4 Scheduled Maintenance Completed
- **Type**: `SCHEDULED_MAINTENANCE_COMPLETED`
- **Category**: `SCHEDULED_MAINTENANCE`
- **When**: When a scheduled maintenance task is marked as completed
- **Triggered By**: `PUT /api/scheduled-maintenance/:id/status` with status "Completed"
- **File**: `backend/modules/workforce-facility/controllers/ScheduledMaintenanceController.js` (line ~525)
- **Recipients**: All Admin users
- **Priority**: `low`
- **Message Format**: `"✓ Scheduled maintenance '[Title]' has been completed by [Technician Name]"`

#### 1.5 Scheduled Maintenance Due Soon
- **Type**: `SCHEDULED_MAINTENANCE_DUE`
- **Category**: `SCHEDULED_MAINTENANCE`
- **When**: When a scheduled maintenance is approaching its due date
- **Triggered By**: *Currently not automatically triggered - requires background job/cron*
- **File**: `backend/services/notificationService.js` (function defined but not called)
- **Recipients**:
  - All Admin users
  - Assigned technician (if assigned)
- **Priority**: `high`
- **Message Format**: `"Scheduled maintenance '[Title]' is due soon"`
- **Implementation Note**: ⚠️ Requires a daily cron job to query upcoming maintenance and send notifications

#### 1.6 Scheduled Maintenance Overdue
- **Type**: `SCHEDULED_MAINTENANCE_OVERDUE`
- **Category**: `SCHEDULED_MAINTENANCE`
- **When**: When a scheduled maintenance is past its due date and not completed
- **Triggered By**: *Currently not automatically triggered - requires background job/cron*
- **File**: `backend/services/notificationService.js` (function defined but not called)
- **Recipients**:
  - All Admin users
  - Assigned technician (if assigned)
- **Priority**: `urgent`
- **Message Format**: `"⚠️ OVERDUE: Scheduled maintenance '[Title]' is past due date!"`
- **Implementation Note**: ⚠️ Requires a daily cron job to query overdue maintenance and send notifications

---

### 2. Maintenance Request Notifications

#### 2.1 New Maintenance Request
- **Type**: `NEW_MAINTENANCE_REQUEST`
- **Category**: `MAINTENANCE_REQUESTS`
- **When**: When a new maintenance request (work order) is created
- **Triggered By**: `POST /api/maintenance-requests` endpoint
- **File**: `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js` (line ~196)
- **Recipients**: All Admin users
- **Priority**: 
  - `medium` for Low/Medium priority requests
  - Escalated to urgent notification if Critical/High priority
- **Message Format**: `"A new maintenance request has been created for [Equipment]: [Description]"`

#### 2.2 Urgent Maintenance Request
- **Type**: `MAINTENANCE_REQUEST_URGENT`
- **Category**: `MAINTENANCE_REQUESTS`
- **When**: When a Critical or High priority maintenance request is created
- **Triggered By**: `POST /api/maintenance-requests` with priority "Critical" or "High"
- **File**: `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js` (line ~194)
- **Recipients**: All Admin users
- **Priority**: `urgent`
- **Message Format**: `"⚠️ URGENT: [Equipment] requires immediate attention! [Description]"`

#### 2.3 Maintenance Request Assigned
- **Type**: `MAINTENANCE_REQUEST_ASSIGNED`
- **Category**: `MAINTENANCE_REQUESTS`
- **When**: When a maintenance request is assigned to a technician
- **Triggered By**: `PUT /api/maintenance-requests/:id` with assignedTo field updated
- **File**: `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js` (line ~500)
- **Recipients**:
  - All Admin users
  - The assigned technician
- **Priority**: `medium`
- **Message Format**: `"Maintenance request for [Equipment] has been assigned to [Technician]"`

#### 2.4 Maintenance Request Status Update
- **Type**: `MAINTENANCE_REQUEST_STATUS_UPDATED`
- **Category**: `MAINTENANCE_REQUESTS`
- **When**: When the status of a maintenance request changes
- **Triggered By**: `PUT /api/maintenance-requests/:id` with status field updated
- **File**: `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js` (line ~503)
- **Recipients**: All Admin users
- **Priority**: `low`
- **Message Format**: `"Request for [Equipment] status changed from [Old Status] to [New Status]"`

#### 2.5 Maintenance Request Completed
- **Type**: `MAINTENANCE_REQUEST_COMPLETED`
- **Category**: `MAINTENANCE_REQUESTS`
- **When**: When a maintenance request is marked as completed
- **Triggered By**: 
  - `PUT /api/maintenance-requests/:id/complete` endpoint
  - `PUT /api/maintenance-requests/:id` with status "Completed"
- **File**: `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js` (lines ~506, ~640)
- **Recipients**: All Admin users
- **Priority**: `low`
- **Message Format**: `"✓ Maintenance request for [Equipment] has been completed successfully by [Technician]"`

---

## Notification Recipients Logic

### Admin Users
- **Query**: `User.find({ role: 'Admin' })`
- **Applies To**: All maintenance notifications by default
- **Purpose**: Keep administrators informed of all maintenance activities

### Technicians
- **Query**: `User.findOne({ _id: technicianId })`
- **Applies To**: 
  - Tasks assigned to them
  - Status updates on their assigned tasks
  - Scheduled maintenance they are assigned to
- **Purpose**: Keep technicians informed of their work assignments and updates

### Notification Filtering
If no admin users exist in the database:
- The notification service logs a warning
- No notification is created (silently skipped)
- The operation continues without error

---

## Implementation Details

### File Structure
```
backend/
├── services/
│   └── notificationService.js          # All notification creation logic
├── modules/workforce-facility/
│   ├── controllers/
│   │   ├── ScheduledMaintenanceController.js   # Scheduled maintenance notifications
│   │   ├── MaintenanceRequestController.js      # Work order notifications
│   │   └── TechnicianController.js              # Technician assignment notifications
│   └── models/
│       └── Notification.js             # Notification schema and methods
```

### Notification Schema Fields
```javascript
{
  type: String,              // Enum of notification types
  category: String,          // SCHEDULED_MAINTENANCE, MAINTENANCE_REQUESTS, etc.
  title: String,             // Short title for display
  message: String,           // Detailed message
  relatedEntity: {
    entityType: String,      // MaintenanceRequest, ScheduledMaintenance, etc.
    entityId: ObjectId       // ID of the related entity
  },
  recipients: [{
    user: ObjectId,          // User who receives notification
    role: String             // User's role
  }],
  isRead: Boolean,           // Overall read status
  readBy: [{                 // Track who has read it
    user: ObjectId,
    readAt: Date
  }],
  priority: String,          // low, medium, high, urgent
  metadata: Mixed            // Additional context data
}
```

---

## How to Add a New Notification

1. **Add notification type to the enum** in `Notification.js` model
2. **Create notification function** in `notificationService.js`:
   ```javascript
   exports.notifyYourEvent = async (entity) => {
     try {
       const recipients = await getAdminUsers();
       // Add technician if needed
       
       await Notification.createNotification({
         type: 'YOUR_EVENT_TYPE',
         category: 'YOUR_CATEGORY',
         title: 'Your Title',
         message: 'Your message',
         relatedEntity: {
           entityType: 'YourEntity',
           entityId: entity._id
         },
         recipients,
         priority: 'medium',
         metadata: { /* additional data */ }
       });
     } catch (error) {
       console.error('Error creating notification:', error);
     }
   };
   ```
3. **Import and call** the notification service in your controller:
   ```javascript
   const notificationService = require('../../../services/notificationService');
   
   // In your controller function:
   await notificationService.notifyYourEvent(yourEntity);
   ```

---

## Recommendations for Future Enhancement

### 1. Implement Automated Due/Overdue Notifications
Currently, `notifyScheduledMaintenanceDue` and `notifyScheduledMaintenanceOverdue` are defined but not automatically triggered.

**Recommendation**: Create a daily cron job:
```javascript
// backend/jobs/maintenanceNotificationJob.js
const cron = require('node-cron');
const ScheduledMaintenance = require('../modules/workforce-facility/models/ScheduledMaintenance');
const notificationService = require('../services/notificationService');

// Run daily at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  // Find maintenance due in next 7 days
  const dueSoon = await ScheduledMaintenance.find({
    scheduled_date: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    status: { $nin: ['Completed', 'Cancelled'] }
  });
  
  for (const maintenance of dueSoon) {
    await notificationService.notifyScheduledMaintenanceDue(maintenance);
  }
  
  // Find overdue maintenance
  const overdue = await ScheduledMaintenance.find({
    scheduled_date: { $lt: new Date() },
    status: { $nin: ['Completed', 'Cancelled'] }
  });
  
  for (const maintenance of overdue) {
    await notificationService.notifyScheduledMaintenanceOverdue(maintenance);
  }
});
```

### 2. Add Real-time Notifications
Consider implementing WebSocket or Server-Sent Events for real-time notification delivery to the admin dashboard.

### 3. Add Email/SMS Integration
Extend the notification service to send critical notifications via email or SMS for urgent maintenance issues.

### 4. Add Notification Preferences
Allow users to configure which types of notifications they want to receive.

---

## Testing Notifications

### Manual Testing Steps
1. **Test New Scheduled Maintenance**:
   - Create a new scheduled maintenance task
   - Verify notification appears for admin users

2. **Test Technician Assignment**:
   - Assign a technician to a scheduled maintenance
   - Verify both admin and technician receive notification

3. **Test Status Updates**:
   - Change status to "In Progress" from technician dashboard
   - Verify notification is sent to admins
   - Change to "Completed"
   - Verify completion notification

4. **Test Maintenance Requests**:
   - Create a new maintenance request
   - Test with different priorities (Low, High, Critical)
   - Assign to technician
   - Complete the request
   - Verify notifications at each step

### Automated Testing
Consider adding integration tests for notification creation:
```javascript
// Example test
describe('Maintenance Notifications', () => {
  it('should create notification when scheduled maintenance is created', async () => {
    const maintenance = await ScheduledMaintenance.create({ /* data */ });
    const notifications = await Notification.find({ 
      'relatedEntity.entityId': maintenance._id 
    });
    expect(notifications.length).toBeGreaterThan(0);
  });
});
```

---

## Summary

The maintenance notification system provides comprehensive coverage for all maintenance activities:

✅ **Scheduled Maintenance**: Created, Assigned, Status Updates, Completed
✅ **Maintenance Requests**: New, Urgent, Assigned, Status Changes, Completed
✅ **Technician Activities**: Assignment notifications, Status change notifications
⏳ **Pending**: Automated due/overdue notifications (requires cron job)

All notifications are sent to admin users by default, with technicians receiving notifications for their assigned tasks. The system is designed to be non-blocking - if notification creation fails, the main operation still succeeds.
