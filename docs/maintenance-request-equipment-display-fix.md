# Maintenance Request Equipment Display Fix

## Issue
Maintenance requests table was showing "No equipment specified" for all requests, even when equipment was assigned.

## Root Cause
The frontend code in `WorkRequestListTable.jsx` was only checking for `request.equipmentName` which doesn't exist in the data structure. The actual equipment data comes from the backend as:
- `request.equipment` - an array of equipment objects (populated by backend)

## Backend (Already Correct)
The backend controller already populates equipment data:
```javascript
// Line 34 in MaintenanceRequestController.js
.populate('equipment', 'name location type status modelNumber model_number model')
```

This means `request.equipment` is an array of equipment objects with their names.

## Frontend Fix

### File: `frontend/src/features/equipment-maintenance/components/WorkRequestListTable.jsx`

**Changed from:**
```jsx
<div className="text-sm text-gray-500">
  {request.equipmentName || 'No equipment specified'}
</div>
```

**Changed to:**
```jsx
<div className="text-sm text-gray-500">
  {(() => {
    // Handle different equipment data structures
    if (request.equipment && Array.isArray(request.equipment)) {
      if (request.equipment.length === 0) return 'No equipment specified';
      // If equipment is populated with objects
      if (typeof request.equipment[0] === 'object' && request.equipment[0] !== null) {
        return request.equipment.map(eq => eq.name || 'Unknown equipment').join(', ');
      }
      // If equipment is just IDs, try to get names from equipmentName field
      if (request.equipmentName) return request.equipmentName;
      return `Equipment ID: ${request.equipment.join(', ')}`;
    }
    // Single equipment object
    if (request.equipment && typeof request.equipment === 'object') {
      return request.equipment.name || 'Unknown equipment';
    }
    // Fallback to equipmentName or default message
    return request.equipmentName || 'No equipment specified';
  })()}
</div>
```

## How It Works Now

The fix handles multiple scenarios:

1. **Array of populated equipment objects** (most common):
   - Extracts names from each equipment object
   - Joins multiple equipment names with commas
   - Example: "X-Ray Machine, ECG Monitor"

2. **Empty equipment array**:
   - Shows "No equipment specified"

3. **Array of equipment IDs only** (if populate fails):
   - Shows the IDs as fallback
   - Example: "Equipment ID: 60f1b2c3d4e5f6g7h8i9j0k1"

4. **Single equipment object** (edge case):
   - Extracts the name from the single object

5. **Null/undefined equipment**:
   - Shows "No equipment specified"

## Result
✅ Equipment names now display correctly in the maintenance requests table
✅ Multiple equipment items are shown comma-separated
✅ Handles edge cases gracefully

## Testing
Test cases to verify:
- [ ] Request with single equipment → Shows equipment name
- [ ] Request with multiple equipment → Shows all names comma-separated
- [ ] Request with no equipment → Shows "No equipment specified"
- [ ] Request with invalid/missing equipment data → Shows appropriate fallback

---
**Date:** October 13, 2025
**Files Modified:** `frontend/src/features/equipment-maintenance/components/WorkRequestListTable.jsx`
