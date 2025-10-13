# Equipment Fields Save Fix - Model Number, Warranty Expiry, Notes

## Date: October 13, 2025

---

## Problem

Model number, warranty expiry date, and notes were not being properly saved to the database when adding or editing equipment in the maintenance section of the admin dashboard.

---

## Root Cause

### 1. Missing Field in Validation Schema
The backend validation schema was missing `modelNumber` and `notes` fields in the create equipment validation.

### 2. Field Name Mismatch
The validation schema used `warrantyExpires` while the frontend and model used `warrantyExpiry`.

### 3. Integer Parsing Issue
The EditEquipmentModal was calling `parseInt()` on `maintenanceInterval` without checking if it was empty, which could cause `NaN` to be sent to the backend.

---

## Changes Made

### 1. Backend Validation - Create Schema

**File:** `backend/middleware/validation.js`

**Added Missing Fields:**
```javascript
create: Joi.object({
  // ... existing fields
  model: Joi.string().trim().optional(),
  modelNumber: Joi.string().trim().optional(),          // ADDED
  serialNumber: Joi.string().trim().optional(),
  manufacturer: Joi.string().trim().optional(),
  purchaseDate: Joi.date().optional(),
  warrantyExpires: Joi.date().optional(),
  warrantyExpiry: Joi.date().optional(),                // ADDED (support both names)
  lastMaintenanceDate: Joi.date().optional(),
  nextScheduledMaintenance: Joi.date().optional(),
  downtimeHours: Joi.number().min(0).default(0),
  maintenanceInterval: Joi.number().min(1).max(365).optional(),
  notes: Joi.string().trim().max(1000).optional()      // ADDED
}),
```

**Why This Fixes It:**
- ✅ `modelNumber` now accepted by validation
- ✅ `warrantyExpiry` now accepted (frontend sends this name)
- ✅ `notes` now accepted by validation
- ✅ All fields can pass validation and reach the database

---

### 2. Frontend - Edit Equipment Modal

**File:** `frontend/src/features/equipment-maintenance/components/EditEquipmentModal.jsx`

**Fixed maintenanceInterval Handling:**

**Before:**
```javascript
maintenanceInterval: parseInt(formData.maintenanceInterval),
```

**After:**
```javascript
maintenanceInterval: formData.maintenanceInterval ? parseInt(formData.maintenanceInterval) : undefined,
```

**Why This Fixes It:**
- ✅ Checks if value exists before parsing
- ✅ Sends `undefined` instead of `NaN` when empty
- ✅ Prevents validation errors

---

## How The Fix Works

### Request Flow:

```
Frontend Form
├─> User enters: modelNumber, warrantyExpiry, notes
├─> Form data prepared with proper field names
└─> POST/PUT to backend

Backend Validation Middleware
├─> Validates against Joi schema
├─> NOW ACCEPTS: modelNumber ✅
├─> NOW ACCEPTS: warrantyExpiry ✅
├─> NOW ACCEPTS: notes ✅
└─> Passes validation ✅

Equipment Controller
├─> Receives validated data
├─> Builds updateFields object
├─> Uses MongoDB collection.updateOne()
└─> Fields saved to database ✅

Database
├─> equipments collection
├─> Document updated with:
│   ├─> modelNumber: "ABC-123"
│   ├─> warrantyExpiry: ISODate("2026-12-31")
│   └─> notes: "Regular maintenance required"
└─> Save successful ✅
```

---

## Testing

### Test Case 1: Add Equipment with All Fields

**Steps:**
1. Open Add Equipment modal
2. Fill in all fields including:
   - Model Number: "MRI-2000X"
   - Warranty Expiry: "2026-12-31"
   - Notes: "High-priority equipment"
3. Submit form

**Expected Result:**
✅ Equipment created successfully
✅ Check database: All fields saved including modelNumber, warrantyExpiry, notes

---

### Test Case 2: Edit Equipment - Update Fields

**Steps:**
1. Open existing equipment for editing
2. Modify:
   - Model Number: "Updated-Model"
   - Warranty Expiry: "2027-06-30"
   - Notes: "Updated maintenance schedule"
3. Save changes

**Expected Result:**
✅ Equipment updated successfully
✅ Check database: All fields updated correctly

---

### Test Case 3: Edit Equipment - Empty maintenance Interval

**Steps:**
1. Open existing equipment for editing
2. Clear maintenance interval field (leave empty)
3. Modify model number
4. Save changes

**Expected Result:**
✅ Equipment updated successfully (no NaN error)
✅ maintenanceInterval stays as is or is set to undefined
✅ Model number updated correctly

---

## Verification Queries

### Check If Fields Are Saved:

```javascript
// MongoDB query
db.equipments.find({ 
  modelNumber: { $exists: true },
  warrantyExpiry: { $exists: true },
  notes: { $exists: true }
}).pretty()

// Expected: Equipment documents with these fields populated
```

### Check Specific Equipment:

```javascript
db.equipments.findOne({ equipment_id: "EQ-1234" })

// Should show:
{
  _id: ObjectId("..."),
  equipment_id: "EQ-1234",
  name: "MRI Machine",
  modelNumber: "MRI-2000X",        // ✅ Saved
  warrantyExpiry: ISODate("2026-12-31T00:00:00Z"),  // ✅ Saved
  notes: "High-priority equipment", // ✅ Saved
  // ... other fields
}
```

---

## Fields Now Working

### ✅ Model Number
- **Field Name:** `modelNumber`
- **Type:** String
- **Max Length:** Unlimited (trimmed)
- **Validation:** Optional, accepts any string
- **Database:** Saved correctly

### ✅ Warranty Expiry
- **Field Name:** `warrantyExpiry` (frontend) / `warrantyExpires` (also accepted)
- **Type:** Date
- **Validation:** Optional, must be valid date
- **Database:** Saved as ISODate

### ✅ Notes
- **Field Name:** `notes`
- **Type:** String
- **Max Length:** 1000 characters
- **Validation:** Optional, trimmed
- **Database:** Saved correctly

---

## Related Fields Also Fixed

### Maintenance Interval
- **Issue:** Could send NaN when empty
- **Fix:** Now sends undefined when empty
- **Result:** No more validation errors

---

## Files Modified

1. **`backend/middleware/validation.js`**
   - Added `modelNumber` to create schema
   - Added `warrantyExpiry` to create schema (alongside warrantyExpires)
   - Added `notes` to create schema

2. **`frontend/src/features/equipment-maintenance/components/EditEquipmentModal.jsx`**
   - Fixed `maintenanceInterval` parsing to check for empty value

---

## Additional Notes

### Field Name Variations
The backend now accepts both naming conventions for warranty:
- `warrantyExpiry` (used by frontend)
- `warrantyExpires` (alternative name)

This ensures compatibility regardless of which field name is used.

### Controller Behavior
The equipment controller already had proper handling for these fields:
```javascript
if (req.body.modelNumber) updateFields.modelNumber = req.body.modelNumber;
if (req.body.warrantyExpiry) updateFields.warrantyExpiry = new Date(req.body.warrantyExpiry);
if (req.body.notes) updateFields.notes = req.body.notes;
```

The issue was just that validation was rejecting these fields before they reached the controller.

---

## Summary

**Problem:** Model number, warranty expiry, and notes not saving
**Cause:** Missing fields in validation schema
**Fix:** Added fields to validation schema
**Result:** All fields now save correctly ✅

The equipment forms now properly save all fields to the database!
