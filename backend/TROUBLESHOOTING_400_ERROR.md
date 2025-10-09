# Troubleshooting: 400 Bad Request on /api/maintenance-requests

## Issue
Getting a 400 (Bad Request) error when accessing `/api/maintenance-requests` endpoint.

## Investigation Results

### ✅ GET Request Works Fine
Tested with curl:
```bash
curl http://localhost:5000/api/maintenance-requests
```
**Result**: 200 OK - Returns 3 maintenance requests successfully

### 🔍 Possible Causes

The 400 error is likely coming from one of these operations:

#### 1. **POST /api/maintenance-requests** (Creating new request)
**Required fields:**
- `title` (string) - **Required**
- `description` (string) - **Required**
- `reportedBy` (ObjectId) - **Required** - Must be valid user ID
- `priority` (string) - Optional, defaults to "Medium"
- `equipment` (array of ObjectIds) - Optional
- `date` (string) - Optional
- `time` (string) - Optional
- `cost` (number) - Optional, defaults to 0

**Common errors:**
- Missing `title`, `description`, or `reportedBy`
- Invalid `reportedBy` user ID
- Invalid equipment IDs in array
- User not found in database

#### 2. **PUT /api/maintenance-requests/:id** (Updating request)
**Possible errors:**
- Invalid request ID
- Request not found
- Invalid field values

#### 3. **PUT /api/maintenance-requests/:id/assign** (Assigning technician)
**Required:**
- `technicianId` (ObjectId) - Must be valid technician ID

**Common errors:**
- Missing technician ID
- Invalid technician ID
- Technician not found

## How to Diagnose

### In Browser DevTools:

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Find the failing request
4. Check:
   - **Request Method** (GET, POST, PUT, DELETE)
   - **Request Payload** (what data is being sent)
   - **Response** tab to see error message

### Check Request Payload

For POST requests creating a maintenance request, verify the payload includes:
```json
{
  "title": "Equipment repair needed",
  "description": "Detailed description",
  "reportedBy": "507f1f77bcf86cd799439011", // Valid user ObjectId
  "priority": "Medium", // or "Low", "High", "Critical"
  "equipment": ["507f1f77bcf86cd799439012"], // Array of equipment IDs
  "cost": 0
}
```

## Solutions

### If reportedBy user doesn't exist:
1. Create the user first using POST `/api/users`
2. OR temporarily disable user validation in the route (line 77 in maintenanceRequestRoutes.js)

### If equipment IDs are invalid:
1. Ensure equipment exists in database
2. Use GET `/api/equipment` to fetch valid equipment IDs

### If validation is failing:
Check the middleware validation schemas in:
- `backend/middleware/validation.js`
- Look for `maintenanceRequestSchemas.create`

## Quick Fixes

### Temporary: Disable strict validation
In `backend/modules/workforce-facility/routes/maintenanceRequestRoutes.js`, line 77:
```javascript
// Comment out this line to skip user validation temporarily
// resourceValidation.checkUserExists('reportedBy', 'body'),
```

### Check for detailed error logs
Backend console should show:
```
🔧 CREATE REQUEST - Received data: {...}
🔧 CREATE REQUEST - Extracted fields: {...}
```

Look for validation error messages after these logs.

## Current Status

✅ **GET /api/maintenance-requests** - Working (returns 3 requests)
❓ **POST /api/maintenance-requests** - Likely source of 400 error
❓ **PUT /api/maintenance-requests/:id** - May also cause 400 if data invalid

## Next Steps

1. **Check browser console** for the exact error message
2. **Check backend terminal** for detailed logs
3. **Verify the request method** causing the 400 error
4. **Check request payload** to ensure all required fields are present
5. **Verify user and equipment IDs exist** in database

## Testing Commands

```bash
# Test GET request
curl http://localhost:5000/api/maintenance-requests

# Test POST request (replace IDs with valid ones)
curl -X POST http://localhost:5000/api/maintenance-requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Request",
    "description": "Testing maintenance request creation",
    "reportedBy": "YOUR_USER_ID_HERE",
    "priority": "Medium"
  }'

# Get list of users (to find valid reportedBy IDs)
curl http://localhost:5000/api/users

# Get list of equipment (to find valid equipment IDs)
curl http://localhost:5000/api/equipment
```
