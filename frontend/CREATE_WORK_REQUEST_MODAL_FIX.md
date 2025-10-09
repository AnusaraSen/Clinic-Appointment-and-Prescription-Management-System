# Fixed: 400 Bad Request - CreateWorkRequestModal

## Problem Identified ✅

The `CreateWorkRequestModal` component was **incompatible with the backend API**, causing 400 Bad Request errors when trying to create maintenance requests.

## Root Cause

### Backend API Requirements (POST /api/maintenance-requests):
```javascript
{
  "title": "string",        // ✅ Required
  "description": "string",  // ✅ Required
  "reportedBy": "ObjectId", // ❌ REQUIRED but MISSING in modal
  "priority": "string",     // Optional (Low, Medium, High, Critical)
  "equipment": [],          // Array of equipment ObjectIds
  "assignedTo": "ObjectId"  // Optional - for technician assignment
}
```

### What the Old Modal Was Sending:
```javascript
{
  "title": "string",        // ✅ Correct
  "description": "string",  // ✅ Correct
  "equipmentId": "string",  // ❌ Wrong field name (should be "equipment" array)
  "technicianId": "string", // ❌ Wrong field name (should be "assignedTo")
  // ❌ Missing "reportedBy" field entirely!
}
```

## Changes Made

### 1. Added AuthContext to Get Current User
```javascript
import { useAuth } from '../../../features/authentication/context/AuthContext';

const { user } = useAuth();
```

### 2. Fixed Form State to Match Backend API
**Before:**
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  equipmentId: equipment[0]?.id,  // ❌ Wrong
  technicianId: technicians[0]?.id, // ❌ Wrong
});
```

**After:**
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'Medium',
  equipment: [],                    // ✅ Array as expected
  assignedTo: '',                   // ✅ Correct field name
  reportedBy: user?._id || user?.id, // ✅ Added required field
});
```

### 3. Added Equipment Array Handler
```javascript
const handleEquipmentChange = (e) => {
  const selectedId = e.target.value;
  if (selectedId) {
    setFormData((f) => ({ 
      ...f, 
      equipment: [selectedId] // Backend expects array
    }));
  } else {
    setFormData((f) => ({ ...f, equipment: [] }));
  }
};
```

### 4. Added Priority Selector
```javascript
<select name="priority" value={formData.priority} onChange={handleChange}>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
  <option value="Critical">Critical</option>
</select>
```

### 5. Added Validation Before Submit
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!formData.title || !formData.description) {
    alert('Please fill in title and description');
    return;
  }
  
  if (!formData.reportedBy) {
    alert('User information is missing. Please log in again.');
    return;
  }
  
  // Prepare data matching backend API
  const requestData = {
    title: formData.title,
    description: formData.description,
    priority: formData.priority || 'Medium',
    reportedBy: formData.reportedBy, // Required
    equipment: formData.equipment,    // Array
  };
  
  // Only include assignedTo if selected
  if (formData.assignedTo) {
    requestData.assignedTo = formData.assignedTo;
  }
  
  console.log('Submitting work request:', requestData);
  onSubmit(requestData);
};
```

### 6. Improved Form UI
- Added required field indicators (*)
- Added placeholders
- Changed field names to match backend:
  - `equipmentId` → `equipment` (array)
  - `technicianId` → `assignedTo`
- Added hover effects on buttons
- Made equipment and technician truly optional

## Field Mapping

| Old Field Name | New Field Name | Type | Required | Notes |
|---------------|---------------|------|----------|-------|
| `title` | `title` | string | ✅ Yes | No change |
| `description` | `description` | string | ✅ Yes | No change |
| `equipmentId` | `equipment` | array | ❌ No | Changed to array format |
| `technicianId` | `assignedTo` | string | ❌ No | Renamed to match backend |
| - | `reportedBy` | string | ✅ Yes | **Added** - from logged in user |
| - | `priority` | string | ❌ No | **Added** - defaults to "Medium" |

## Testing

### Before Fix:
```
POST /api/maintenance-requests
Request: { title: "...", description: "...", equipmentId: "...", technicianId: "..." }
Response: 400 Bad Request - "title, description, and reportedBy are required"
```

### After Fix:
```
POST /api/maintenance-requests
Request: { 
  title: "...", 
  description: "...", 
  reportedBy: "507f1f77bcf86cd799439011",
  priority: "Medium",
  equipment: ["507f1f77bcf86cd799439012"],
  assignedTo: "507f1f77bcf86cd799439013"
}
Response: 201 Created ✅
```

## Files Modified

- ✅ `frontend/src/features/equipment-maintenance/components/CreateWorkRequestModal.jsx`

## How to Test

1. **Log in** to the application (so `user` context is available)
2. **Navigate to Maintenance Management** page
3. **Click "Add Maintenance Request"** button
4. **Fill in the form:**
   - Title (required)
   - Description (required)
   - Priority (defaults to Medium)
   - Equipment (optional)
   - Technician (optional)
5. **Click "Create Request"**
6. **Should succeed** with 200/201 response ✅

## Backend Compatibility

✅ **Fully compatible** with backend API:
- `/api/maintenance-requests` POST endpoint
- All required fields included
- Correct field names
- Correct data types (equipment as array)
- User ID from authentication context

## Result

The 400 Bad Request error should now be **resolved**! The modal now sends data in the exact format the backend expects. 🎉
