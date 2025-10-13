# Equipment Maintenance Interval Fix

## Date: October 13, 2025

---

## Problem Summary

Two issues were identified when adding new equipment:

1. **Mandatory Field Issue**: The maintenance interval field was required, forcing users to enter a value even when not applicable
2. **Auto-Scheduling Issue**: Equipment was automatically being scheduled for maintenance after creation, rather than remaining "Operational"

---

## Root Cause Analysis

### Issue 1: Mandatory Maintenance Interval
- Frontend validation required a value for `maintenanceInterval`
- Backend model didn't explicitly mark it as optional
- Default value of 90 days was being enforced

### Issue 2: Auto-Scheduling
- The `createEquipment` controller function was calling `autoScheduleForEquipment()` after creating equipment
- This automatically created a scheduled maintenance task for all new equipment
- Equipment status remained "Operational" but was being scheduled unnecessarily

---

## Changes Made

### 1. Frontend - Add Equipment Modal

**File:** `frontend/src/features/equipment-maintenance/components/AddEquipmentModal.jsx`

#### A. Changed Default Value
**Before:**
```javascript
maintenanceInterval: 90,
```

**After:**
```javascript
maintenanceInterval: '',  // Empty string = optional field
```

#### B. Updated Validation Logic
**Before:**
```javascript
case 'maintenanceInterval':
  error = validators.numberRange(value, 1, 365, 'Maintenance interval');
  break;
```

**After:**
```javascript
case 'maintenanceInterval':
  // Only validate if a value is provided (optional field)
  if (value && value.trim() !== '') {
    error = validators.numberRange(value, 1, 365, 'Maintenance interval');
  }
  break;
```

#### C. Updated Payload Preparation
**Before:**
```javascript
maintenanceInterval: parseInt(formData.maintenanceInterval),
```

**After:**
```javascript
maintenanceInterval: formData.maintenanceInterval ? parseInt(formData.maintenanceInterval) : undefined,
```

#### D. Updated Help Text
**Before:**
```jsx
helpText="1-365 days"
```

**After:**
```jsx
helpText="Optional (1-365 days). Leave empty if not applicable."
```

---

### 2. Backend - Equipment Model

**File:** `backend/modules/workforce-facility/models/Equipments.js`

#### Updated Field Definition
**Before:**
```javascript
maintenanceInterval: { type: Number, min: 1, max: 365, default: 90 },
```

**After:**
```javascript
maintenanceInterval: { 
  type: Number, 
  min: 1, 
  max: 365,
  required: false  // Made optional - not all equipment needs regular maintenance intervals
},
```

---

### 3. Backend - Equipment Controller

**File:** `backend/modules/workforce-facility/controllers/EquipmentController.js`

#### A. Conditional Field Addition
**Before:**
```javascript
const basicData = {
  equipment_id: req.body.equipment_id,
  name: req.body.name,
  type: req.body.type,
  location: req.body.location,
  status: req.body.status || 'Operational',
  isCritical: req.body.isCritical || false,
  maintenanceInterval: req.body.maintenanceInterval || 90
};
```

**After:**
```javascript
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
```

#### B. Removed Auto-Scheduling
**Before:**
```javascript
// Auto-schedule preventive maintenance for new equipment
try {
  const scheduledMaintenance = await autoScheduleForEquipment(updatedEquipment.equipment_id, 'Preventive');
  console.log(`✅ Auto-scheduled preventive maintenance for ${updatedEquipment.equipment_id} on ${scheduledMaintenance.scheduled_date.toDateString()}`);
} catch (scheduleError) {
  console.warn(`⚠️ Failed to auto-schedule maintenance for ${updatedEquipment.equipment_id}:`, scheduleError.message);
}

return res.status(201).json({
  success: true,
  message: 'Equipment created successfully and preventive maintenance scheduled',
  data: updatedEquipment
});
```

**After:**
```javascript
// Note: Automatic maintenance scheduling removed - equipment stays operational until manually scheduled

return res.status(201).json({
  success: true,
  message: 'Equipment created successfully',
  data: updatedEquipment
});
```

---

### 4. Backend - Validation Middleware

**File:** `backend/middleware/validation.js`

#### A. Added to Create Schema
```javascript
maintenanceInterval: Joi.number().min(1).max(365).optional()
```

#### B. Updated Update Schema
**Before:**
```javascript
maintenanceInterval: Joi.number().min(1)
```

**After:**
```javascript
maintenanceInterval: Joi.number().min(1).max(365).optional()
```

---

## Behavior Changes

### Before Fix:
1. ❌ User forced to enter maintenance interval when adding equipment
2. ❌ Equipment automatically scheduled for maintenance after creation
3. ❌ All equipment had default 90-day maintenance interval

### After Fix:
1. ✅ Maintenance interval is optional - user can leave it blank
2. ✅ Equipment remains "Operational" after creation (no auto-scheduling)
3. ✅ Equipment without maintenance interval won't have scheduled maintenance
4. ✅ User can add maintenance interval only for equipment that needs it

---

## Use Cases

### Equipment WITHOUT Maintenance Interval
**Examples:**
- Office furniture
- Simple tools
- Non-critical equipment
- Equipment maintained on-demand only

**Behavior:**
- Leave maintenance interval field empty when adding
- Equipment status: "Operational"
- No automatic scheduled maintenance
- Maintenance can be scheduled manually when needed

### Equipment WITH Maintenance Interval
**Examples:**
- Medical devices
- Laboratory equipment
- Critical machinery
- Equipment requiring regular servicing

**Behavior:**
- Enter maintenance interval (e.g., 90 days) when adding
- Equipment status: "Operational"
- Field stored in database for reference
- Maintenance can be scheduled manually based on the interval

---

## Impact on Existing Features

### ✅ Maintained Compatibility
- Existing equipment with maintenance intervals will continue to work
- Manual scheduling still available for all equipment
- Equipment can be updated to add/remove maintenance interval later

### ⚠️ Breaking Changes
- Equipment created before this fix may have default 90-day interval
- Auto-scheduled maintenance tasks from old equipment creation may exist in database
- Consider running cleanup query to remove unwanted scheduled tasks

---

## Database Cleanup (Optional)

If you want to remove auto-scheduled maintenance for newly created equipment:

```javascript
// Remove all scheduled maintenance tasks that were auto-created for new equipment
// Be careful - only run this if you're sure you want to remove ALL preventive maintenance
db.scheduledmaintenances.deleteMany({
  type: 'Preventive',
  status: 'Scheduled',
  description: /automatically scheduled/i
});
```

---

## Testing Checklist

### Frontend Testing
- [ ] Open Add Equipment modal
- [ ] Leave maintenance interval field empty
- [ ] Fill all required fields (name, type, location)
- [ ] Submit form - should succeed without validation error
- [ ] Verify equipment created with status "Operational"
- [ ] Add another equipment WITH maintenance interval (e.g., 90 days)
- [ ] Verify both types of equipment save correctly

### Backend Testing
- [ ] Test POST /api/equipment without maintenanceInterval
- [ ] Verify response status 201 and equipment created
- [ ] Verify equipment status is "Operational"
- [ ] Verify no scheduled maintenance auto-created
- [ ] Test POST /api/equipment with maintenanceInterval: 90
- [ ] Verify maintenanceInterval stored in database
- [ ] Verify still no auto-scheduled maintenance

### Database Testing
- [ ] Check equipment document without maintenanceInterval field
- [ ] Check equipment document with maintenanceInterval field
- [ ] Verify no unnecessary scheduled maintenance tasks created

---

## Files Modified

### Frontend (1 file)
1. `frontend/src/features/equipment-maintenance/components/AddEquipmentModal.jsx`
   - Made maintenanceInterval optional
   - Updated validation logic
   - Changed default value from 90 to empty string
   - Updated help text

### Backend (3 files)
1. `backend/modules/workforce-facility/models/Equipments.js`
   - Made maintenanceInterval field optional (required: false)
   - Removed default value

2. `backend/modules/workforce-facility/controllers/EquipmentController.js`
   - Made maintenanceInterval conditional in basicData
   - Removed auto-scheduling logic
   - Updated success message

3. `backend/middleware/validation.js`
   - Added maintenanceInterval to create schema as optional
   - Updated update schema to include max value and optional flag

---

## Benefits

1. ✅ **Better User Experience** - No forced input for irrelevant fields
2. ✅ **Accurate Data** - Only store maintenance intervals when actually needed
3. ✅ **No Unwanted Scheduling** - Equipment stays operational until manually scheduled
4. ✅ **Cleaner Database** - No unnecessary scheduled maintenance tasks
5. ✅ **Flexible Workflow** - Users can choose when to schedule maintenance

---

## Related Documentation

- See `docs/equipment-status-update-oct2025.md` for equipment status changes
- See `docs/maintenance-notifications-guide.md` for maintenance notification system
- See `docs/maintenance-enhancements-oct2025.md` for maintenance features

---

## Rollback Instructions

If you need to revert these changes:

1. **Restore Frontend Default**
   - Change `maintenanceInterval: ''` back to `maintenanceInterval: 90`
   - Remove optional validation logic
   - Restore original help text

2. **Restore Backend Model**
   - Add `default: 90` back to maintenanceInterval field
   - Remove `required: false`

3. **Restore Auto-Scheduling**
   - Add back the `autoScheduleForEquipment()` call in createEquipment controller
   - Restore original success message

4. **Restore Validation**
   - Make maintenanceInterval required in create schema (remove .optional())
