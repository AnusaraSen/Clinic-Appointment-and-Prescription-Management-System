# Automatic Maintenance Scheduler Implementation

## Date: October 13, 2025

---

## Overview

Implemented an **automated maintenance scheduling system** that:
1. ✅ **Auto-schedules preventive maintenance** when new equipment is created
2. ✅ **Keeps equipment "Operational"** status after creation
3. ✅ **Automatically changes status to "Under Maintenance"** when the scheduled date arrives
4. ✅ **Sends notifications** to admins and technicians when maintenance starts

---

## System Architecture

### Components Created/Modified

```
Backend Services:
├── maintenanceSchedulerService.js (NEW)    - Automated scheduler
├── notificationService.js (MODIFIED)       - Added maintenance start notifications
├── equipmentController.js (MODIFIED)       - Restored auto-scheduling
└── server.js (MODIFIED)                    - Initialize scheduler on startup

Cron Job:
└── Runs every hour to check for due maintenance
```

---

## How It Works

### Workflow Diagram

```
1. Equipment Created
   └─> Status: "Operational"
   └─> Auto-schedule preventive maintenance (e.g., 90 days from now)
   └─> Scheduled maintenance record created in database

2. Every Hour (Cron Job Runs)
   └─> Check: Any maintenance scheduled for today?
   └─> If YES:
       ├─> Update equipment status: "Operational" → "Under Maintenance"
       ├─> Set downtimeStart timestamp
       └─> Send notifications to:
           ├─> All Admin users
           └─> Assigned Technician (if assigned)

3. Notification Sent
   └─> Type: "Maintenance Started"
   └─> Priority: Medium
   └─> Message: "Scheduled maintenance has started for [Equipment]. Status changed to 'Under Maintenance'."
```

---

## Files Created

### 1. Maintenance Scheduler Service

**File:** `backend/services/maintenanceSchedulerService.js`

**Purpose:** Automated background service that checks for due maintenance tasks

**Key Functions:**

#### `processDueMaintenance()`
- Finds all scheduled maintenance with status "Scheduled" or "Assigned"
- Checks if scheduled_date is today or in the past
- Updates equipment status to "Under Maintenance"
- Sends notifications

**Logic:**
```javascript
// Find due maintenance
const dueMaintenance = await ScheduledMaintenance.find({
  status: { $in: ['Scheduled', 'Assigned'] },
  scheduled_date: { $lte: endOfDay }
})

// For each maintenance task
for (const maintenance of dueMaintenance) {
  // Update each equipment
  for (const equipmentItem of maintenance.equipment) {
    if (equipmentItem.status === 'Operational') {
      await Equipment.findByIdAndUpdate(equipmentItem._id, { 
        status: 'Under Maintenance',
        downtimeStart: new Date()
      });
    }
  }
  
  // Send notification
  await sendMaintenanceStartNotification(maintenance);
}
```

#### `initializeMaintenanceScheduler()`
- Runs immediately on server startup (initial check)
- Sets up cron job to run every hour at minute 0
- Timezone: Asia/Colombo (configurable)

**Cron Schedule:**
```javascript
// Runs every hour at minute 0 (00:00, 01:00, 02:00, etc.)
cron.schedule('0 * * * *', async () => {
  await processDueMaintenance();
})
```

#### `manualMaintenanceCheck()`
- Allows manual triggering of maintenance check
- Useful for testing or on-demand execution

---

## Files Modified

### 1. Equipment Controller

**File:** `backend/modules/workforce-facility/controllers/EquipmentController.js`

**Changes:**
- ✅ Restored automatic scheduling call in `createEquipment()`
- ✅ Equipment remains "Operational" after creation
- ✅ Success message updated

**Code:**
```javascript
// Auto-schedule preventive maintenance for new equipment
// Equipment stays "Operational" - status will change automatically when maintenance date arrives
try {
  const scheduledMaintenance = await autoScheduleForEquipment(updatedEquipment.equipment_id, 'Preventive');
  console.log(`✅ Auto-scheduled preventive maintenance for ${updatedEquipment.equipment_id}`);
} catch (scheduleError) {
  console.warn(`⚠️ Failed to auto-schedule maintenance: ${scheduleError.message}`);
}
```

---

### 2. Notification Service

**File:** `backend/services/notificationService.js`

**New Function:** `notifyMaintenanceStarted(maintenanceId, equipmentNames, assignedTechnician)`

**Purpose:** Send notification when scheduled maintenance begins

**Recipients:**
- All Admin users
- Assigned Technician (if exists)

**Notification Details:**
```javascript
{
  type: 'SCHEDULED_MAINTENANCE_STATUS_UPDATED',
  category: 'SCHEDULED_MAINTENANCE',
  title: 'Maintenance Started',
  message: 'Scheduled maintenance has started for [Equipment]. Status changed to "Under Maintenance".',
  priority: 'Medium',
  metadata: {
    equipmentNames: 'MRI Machine, X-Ray Unit',
    technicianName: 'John Doe',
    status: 'Started'
  }
}
```

---

### 3. Server Configuration

**File:** `backend/server.js`

**Changes:**
- ✅ Imported maintenanceSchedulerService
- ✅ Initialize scheduler on startup after database connection

**Code:**
```javascript
const maintenanceSchedulerService = require('./services/maintenanceSchedulerService');

// In startup sequence
await connectToDatabase();
equipmentStatusService.initializeEquipmentStatusChecker();
maintenanceSchedulerService.initializeMaintenanceScheduler(); // NEW
```

---

## Complete Timeline Example

### Day 0: Equipment Creation
```
Action: Admin adds new "MRI Machine"
Status: Operational ✅
Maintenance Scheduled: Day 90 (3 months from now)
Notification: None
```

### Day 1-89: Normal Operation
```
Status: Operational ✅
Scheduled Maintenance: Waiting in database (status: "Scheduled")
Cron Job: Runs every hour, finds no due maintenance
```

### Day 90: Maintenance Date Arrives

**Hour 00:00 (Midnight):**
```
Cron Job Runs:
├─> Finds: MRI Machine maintenance scheduled for today
├─> Updates: Equipment status → "Under Maintenance" ⚠️
├─> Sets: downtimeStart = 2025-01-12 00:00:00
└─> Sends Notification:
    ├─> To: All Admins
    ├─> To: Assigned Technician (if assigned)
    └─> Message: "Scheduled maintenance has started for MRI Machine"
```

**Admin Dashboard:**
```
Notification Panel:
🔔 "Maintenance Started"
   "Scheduled maintenance has started for MRI Machine. 
    Equipment status changed to 'Under Maintenance'. 
    Assigned to John Doe."
```

### Day 90: Technician Completes Maintenance
```
Technician Action: Marks maintenance as "Completed"
Equipment Status: "Operational" ✅ (automatically restored)
Notification: "Maintenance completed" (existing functionality)
```

---

## Configuration

### Cron Schedule
**Current:** Every hour at minute 0
```javascript
'0 * * * *' // At 00:00, 01:00, 02:00, ..., 23:00
```

**Customize frequency:**
```javascript
// Every 30 minutes
'*/30 * * * *'

// Every 15 minutes
'*/15 * * * *'

// Twice a day (6 AM and 6 PM)
'0 6,18 * * *'

// Once a day at 8 AM
'0 8 * * *'
```

### Timezone
**Current:** Asia/Colombo
```javascript
timezone: "Asia/Colombo"
```

**Change timezone:**
```javascript
timezone: "America/New_York"
timezone: "Europe/London"
timezone: "Asia/Tokyo"
```

---

## Testing

### Manual Testing Steps

#### 1. Test Equipment Creation with Auto-Scheduling
```bash
POST /api/equipment
{
  "name": "Test MRI",
  "type": "Diagnostic",
  "location": "Radiology",
  "status": "Operational",
  "maintenanceInterval": 90
}

Expected:
✅ Equipment created with status "Operational"
✅ Scheduled maintenance created for ~90 days from now
✅ Check database: scheduledmaintenances collection
```

#### 2. Test Manual Maintenance Check
```javascript
// Run in Node.js REPL or script
const scheduler = require('./services/maintenanceSchedulerService');
await scheduler.manualMaintenanceCheck();

Expected Output:
🔍 Checking for scheduled maintenance tasks due today...
📋 Found X maintenance tasks due for processing
✅ Updated [equipment] status to "Under Maintenance"
📧 Sent maintenance start notification
```

#### 3. Test with Past Date (Force Immediate Trigger)
```bash
# Create scheduled maintenance with yesterday's date
POST /api/scheduled-maintenance
{
  "equipment_id": ["existing-equipment-id"],
  "scheduled_date": "2025-10-12", // Yesterday
  "status": "Scheduled"
}

# Run manual check
const scheduler = require('./services/maintenanceSchedulerService');
await scheduler.manualMaintenanceCheck();

Expected:
✅ Equipment status changes to "Under Maintenance"
✅ Notification sent
```

#### 4. Verify Cron Job Running
```bash
# Check server logs after startup
🚀 Initializing Maintenance Scheduler Service...
🔍 Checking for scheduled maintenance tasks due today...
✅ Initial maintenance check completed: { processed: 0, updated: 0, errors: 0 }
✅ Maintenance Scheduler initialized - Running every hour

# Wait for next hour, check logs again
⏰ Running scheduled maintenance check...
✅ Scheduled check completed: { ... }
```

---

## Benefits

### 1. Automated Workflow
- ✅ No manual intervention needed
- ✅ Equipment status updates automatically
- ✅ Notifications sent automatically
- ✅ Reduces human error

### 2. Predictive Maintenance
- ✅ Equipment maintenance scheduled proactively
- ✅ Prevents unexpected breakdowns
- ✅ Extends equipment lifespan
- ✅ Compliance with maintenance schedules

### 3. Better Visibility
- ✅ Admins notified when maintenance starts
- ✅ Technicians know when equipment goes down
- ✅ Clear audit trail in notifications
- ✅ Real-time status updates

### 4. Improved Operations
- ✅ No "forgotten" maintenance tasks
- ✅ Equipment properly marked as unavailable
- ✅ Better resource planning
- ✅ Reduced downtime surprises

---

## Troubleshooting

### Issue: Cron Job Not Running

**Check:**
```bash
# Verify scheduler initialized in logs
grep "Maintenance Scheduler initialized" backend.log

# Check for errors
grep "ERROR.*maintenance" backend.log
```

**Solution:**
- Ensure `node-cron` is installed: `npm install node-cron`
- Verify server.js calls `initializeMaintenanceScheduler()`
- Check timezone is valid

---

### Issue: Equipment Status Not Updating

**Check:**
```javascript
// Verify scheduled maintenance exists
db.scheduledmaintenances.find({ 
  scheduled_date: { $lte: new Date() },
  status: { $in: ['Scheduled', 'Assigned'] }
})

// Check equipment is Operational
db.equipments.find({ status: 'Operational' })
```

**Solution:**
- Verify scheduled_date is today or past
- Ensure equipment status is "Operational" (not already "Under Maintenance")
- Check maintenance status is "Scheduled" or "Assigned"

---

### Issue: No Notifications Sent

**Check:**
```javascript
// Verify admin users exist
db.users.find({ role: 'Admin' })

// Check notification created
db.notifications.find({ type: 'SCHEDULED_MAINTENANCE_STATUS_UPDATED' })
  .sort({ createdAt: -1 })
  .limit(10)
```

**Solution:**
- Ensure at least one Admin user exists
- Verify notificationService.notifyMaintenanceStarted() is called
- Check notification recipients array is not empty

---

## Database Impact

### Collections Modified

#### 1. equipments
```javascript
// Status updated from "Operational" to "Under Maintenance"
{
  _id: ObjectId(...),
  status: "Under Maintenance",  // Changed
  downtimeStart: ISODate("2025-10-13T00:00:00Z")  // Added
}
```

#### 2. scheduledmaintenances
```javascript
// No changes - remains "Scheduled" or "Assigned"
// Status only changes when technician marks as "In Progress" or "Completed"
{
  _id: ObjectId(...),
  status: "Scheduled",  // Unchanged
  scheduled_date: ISODate("2025-10-13")
}
```

#### 3. notifications
```javascript
// New notification created
{
  type: "SCHEDULED_MAINTENANCE_STATUS_UPDATED",
  category: "SCHEDULED_MAINTENANCE",
  title: "Maintenance Started",
  message: "Scheduled maintenance has started...",
  recipients: [
    { user: ObjectId(admin1), role: "Admin" },
    { user: ObjectId(admin2), role: "Admin" },
    { user: ObjectId(technician), role: "Technician" }
  ],
  isRead: false,
  priority: "Medium"
}
```

---

## Performance Considerations

### Cron Job Efficiency
- ✅ Runs once per hour (low overhead)
- ✅ Uses indexed queries (scheduled_date, status)
- ✅ Processes only due maintenance (not entire database)
- ✅ Async/await for non-blocking operations

### Database Queries
```javascript
// Optimized query with indexes
ScheduledMaintenance.find({
  status: { $in: ['Scheduled', 'Assigned'] },  // Indexed
  scheduled_date: { $lte: endOfDay }           // Indexed
})
.populate('equipment', 'equipment_id name status')  // Only needed fields
```

### Recommended Indexes
```javascript
// scheduledmaintenances collection
db.scheduledmaintenances.createIndex({ scheduled_date: 1, status: 1 })

// equipments collection
db.equipments.createIndex({ status: 1 })

// users collection (already exists)
db.users.createIndex({ role: 1 })
```

---

## Future Enhancements

### 1. Advance Notifications
Send notification 24 hours before maintenance:
```javascript
// Add to scheduler
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const upcomingMaintenance = await ScheduledMaintenance.find({
  scheduled_date: { $gte: today, $lte: tomorrow },
  status: 'Scheduled'
});

// Send "Maintenance Tomorrow" notifications
```

### 2. Reminder Notifications
If maintenance not started 2 hours after scheduled time:
```javascript
const overdue = await ScheduledMaintenance.find({
  scheduled_date: { $lt: twoHoursAgo },
  status: 'Scheduled'
});

// Send reminder to admins
```

### 3. Escalation
If maintenance still not completed after X hours:
```javascript
// Escalate to management
// Change priority to "High"
// Send urgent notifications
```

### 4. SMS/Email Integration
```javascript
// In notifyMaintenanceStarted()
if (assignedTechnician.phone) {
  await sendSMS(assignedTechnician.phone, message);
}
if (assignedTechnician.email) {
  await sendEmail(assignedTechnician.email, message);
}
```

---

## Related Documentation

- See `docs/maintenance-notifications-guide.md` - Complete notification system guide
- See `docs/equipment-status-update-oct2025.md` - Equipment status changes
- See `docs/equipment-maintenance-interval-fix-oct2025.md` - Maintenance interval updates

---

## Rollback Instructions

If you need to disable automatic scheduling:

### 1. Remove Scheduler Initialization
```javascript
// In server.js, comment out:
// maintenanceSchedulerService.initializeMaintenanceScheduler();
```

### 2. Remove Auto-Scheduling from Equipment Creation
```javascript
// In EquipmentController.js, comment out:
// const scheduledMaintenance = await autoScheduleForEquipment(updatedEquipment.equipment_id, 'Preventive');
```

### 3. Stop Cron Job
```javascript
// Get scheduler instance
const schedulerJob = maintenanceSchedulerService.initializeMaintenanceScheduler();

// Stop it
schedulerJob.stop();
```

---

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify cron job is running (look for hourly log entries)
3. Manually test with `manualMaintenanceCheck()`
4. Check database for scheduled maintenance records
5. Verify admin users exist in database

**Log Examples:**
```bash
# Success
✅ Scheduled check completed: { processed: 3, updated: 3, errors: 0 }

# No maintenance due
📋 Found 0 maintenance tasks due for processing

# Error
❌ Error processing maintenance: Equipment not found
```
