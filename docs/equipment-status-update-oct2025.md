# Equipment Status Update - Removed "Scheduled for Maintenance"

## Date: October 13, 2025

---

## Summary of Changes

**Objective:** Remove the "Scheduled for Maintenance" status from the equipment section in the maintenance module of the admin dashboard.

**Rationale:** Simplify equipment status management by consolidating maintenance-related statuses. Equipment will now use "Under Maintenance" when maintenance work is being performed, rather than having separate "Scheduled for Maintenance" and "Under Maintenance" statuses.

---

## Changes Made

### 1. Backend - Database Model

**File:** `backend/modules/workforce-facility/models/Equipments.js`

#### A. Updated Status Enum
**Before:**
```javascript
enum: {
  values: ['Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair', 'Scheduled for Maintenance'],
  message: 'Equipment status must be one of the predefined options'
}
```

**After:**
```javascript
enum: {
  values: ['Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair'],
  message: 'Equipment status must be one of the predefined options'
}
```

#### B. Updated scheduleNextMaintenance Method
**Before:**
```javascript
equipmentSchema.methods.scheduleNextMaintenance = function (date) {
  this.nextMaintenance = date;
  if (this.status === 'Operational') this.status = 'Scheduled for Maintenance';
  return this.save();
};
```

**After:**
```javascript
equipmentSchema.methods.scheduleNextMaintenance = function (date) {
  this.nextMaintenance = date;
  // Status remains unchanged when scheduling maintenance
  return this.save();
};
```

---

### 2. Backend - Validation Middleware

**File:** `backend/middleware/validation.js`

Updated three validation schemas:

#### A. Create Equipment Schema
```javascript
status: Joi.string()
  .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair')
  .default('Operational'),
```

#### B. Update Equipment Schema
```javascript
status: Joi.string()
  .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair'),
```

#### C. Status Update Schema
```javascript
status: Joi.string()
  .valid('Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair')
  .required(),
```

---

### 3. Backend - Equipment Controller

**File:** `backend/modules/workforce-facility/controllers/EquipmentController.js`

#### A. Updated Dashboard Statistics Query
**Before:**
```javascript
const maintenanceCount = await Equipment.countDocuments({ 
  status: { $in: ['Under Maintenance', 'Scheduled for Maintenance'] }
});
```

**After:**
```javascript
const maintenanceCount = await Equipment.countDocuments({ 
  status: 'Under Maintenance'
});
```

#### B. Updated Maintenance Request Handler
**Before:**
```javascript
let newStatus = 'Scheduled for Maintenance';
if (priority === 'High') {
  newStatus = 'Needs Repair';
}
```

**After:**
```javascript
let newStatus = 'Under Maintenance';
if (priority === 'High') {
  newStatus = 'Needs Repair';
}
```

---

### 4. Frontend - Equipment List Table

**File:** `frontend/src/features/equipment-maintenance/components/EquipmentListTable.jsx`

#### A. Removed Status Filter Option
Removed the "Scheduled" option from the status filter dropdown.

#### B. Removed Status Badge Rendering
Removed the case for "Scheduled for Maintenance" status badge display.

---

### 5. Frontend - Add Equipment Modal

**File:** `frontend/src/features/equipment-maintenance/components/AddEquipmentModal.jsx`

Removed "Scheduled for Maintenance" option from the status dropdown:
```jsx
<option value="Operational">Operational</option>
<option value="Under Maintenance">Under Maintenance</option>
<option value="Out of Service">Out of Service</option>
<option value="Needs Repair">Needs Repair</option>
```

---

### 6. Frontend - Edit Equipment Modal

**File:** `frontend/src/features/equipment-maintenance/components/EditEquipmentModal.jsx`

Removed "Scheduled for Maintenance" option from the status dropdown (same as Add Equipment Modal).

---

## Current Equipment Status Options

After this update, the available equipment statuses are:

1. ✅ **Operational** - Equipment is working normally
2. ⚠️ **Under Maintenance** - Equipment is undergoing maintenance (scheduled or reactive)
3. ❌ **Out of Service** - Equipment is not functional
4. 🔧 **Needs Repair** - Equipment requires immediate attention/repair

---

## Impact Assessment

### Positive Impacts
1. ✅ **Simplified Status Management** - Fewer status options to choose from
2. ✅ **Reduced Confusion** - Clear distinction between working and non-working equipment
3. ✅ **Cleaner UI** - Fewer filter options in admin dashboard
4. ✅ **Consistent Behavior** - All maintenance work uses same status regardless of planning

### Migration Considerations

#### Existing Data
- Equipment currently marked as "Scheduled for Maintenance" should be updated to "Under Maintenance" or "Operational"
- Run a data migration script to update existing records (see below)

#### Database Migration Script
```javascript
// Run this in MongoDB or via migration script
db.equipments.updateMany(
  { status: 'Scheduled for Maintenance' },
  { $set: { status: 'Under Maintenance' } }
);
```

---

## Testing Checklist

### Backend Testing
- [ ] Verify equipment can be created with valid statuses only
- [ ] Verify equipment cannot be created with "Scheduled for Maintenance" status (validation error)
- [ ] Verify equipment updates reject "Scheduled for Maintenance" status
- [ ] Verify dashboard statistics count maintenance equipment correctly
- [ ] Verify maintenance request creation sets status to "Under Maintenance" for normal priority
- [ ] Verify maintenance request creation sets status to "Needs Repair" for high priority

### Frontend Testing
- [ ] Verify status filter dropdown does not show "Scheduled" option
- [ ] Verify Add Equipment modal does not show "Scheduled for Maintenance" option
- [ ] Verify Edit Equipment modal does not show "Scheduled for Maintenance" option
- [ ] Verify equipment list displays correctly with remaining statuses
- [ ] Verify no errors when filtering equipment by status

### Data Migration Testing
- [ ] Run migration script on test database
- [ ] Verify all "Scheduled for Maintenance" records updated to "Under Maintenance"
- [ ] Verify no equipment has invalid status after migration
- [ ] Test dashboard with migrated data

---

## Rollback Instructions

If you need to revert these changes:

1. **Restore Backend Model**
   - Add "Scheduled for Maintenance" back to Equipments.js enum
   - Restore original scheduleNextMaintenance method logic

2. **Restore Validation**
   - Add "Scheduled for Maintenance" back to all three validation schemas

3. **Restore Controller Logic**
   - Update dashboard statistics to include "Scheduled for Maintenance"
   - Change handleMaintenanceRequestCreated to use "Scheduled for Maintenance" for normal priority

4. **Restore Frontend Components**
   - Add "Scheduled for Maintenance" option back to all dropdowns
   - Restore status badge rendering case

5. **Revert Data Migration**
   ```javascript
   // Only if you need to restore scheduled maintenance records
   // Note: This may not be accurate for all records
   db.equipments.updateMany(
     { 
       status: 'Under Maintenance',
       nextMaintenance: { $exists: true, $ne: null },
       lastMaintenance: { $exists: false }
     },
     { $set: { status: 'Scheduled for Maintenance' } }
   );
   ```

---

## Files Modified

### Backend (4 files)
1. `backend/modules/workforce-facility/models/Equipments.js`
2. `backend/middleware/validation.js`
3. `backend/modules/workforce-facility/controllers/EquipmentController.js`

### Frontend (3 files)
1. `frontend/src/features/equipment-maintenance/components/EquipmentListTable.jsx`
2. `frontend/src/features/equipment-maintenance/components/AddEquipmentModal.jsx`
3. `frontend/src/features/equipment-maintenance/components/EditEquipmentModal.jsx`

---

## Next Steps

1. ✅ Code changes completed
2. ⏳ Run database migration script to update existing records
3. ⏳ Test all affected functionality
4. ⏳ Deploy to staging environment
5. ⏳ Verify in staging
6. ⏳ Deploy to production
7. ⏳ Monitor for any issues

---

## Support & Questions

For questions or issues related to this change:
1. Check that database migration has been run
2. Verify no equipment has "Scheduled for Maintenance" status in database
3. Clear browser cache if frontend still shows old status options
4. Check console logs for validation errors

---

## Related Documentation

- See `docs/maintenance-notifications-guide.md` for maintenance notification system
- See `docs/maintenance-enhancements-oct2025.md` for recent maintenance features
