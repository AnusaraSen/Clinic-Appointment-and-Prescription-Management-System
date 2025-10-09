# Reports System Fixes Summary
**Date**: October 9, 2025

## Issues Fixed

### 1. ✅ Last Login Column Showing "Never" (Fixed)
**Issue**: Users table in reports showed "Never" for all users' Last Login column even after users logged in.

**Root Cause**: Backend GET /api/users endpoint wasn't including `lastLogin` field in the response.

**Fix**: 
- Updated `backend/modules/workforce-facility/routes/userRoutes.js`
- Added `lastLogin` to the `.select()` clause

**Files Modified**:
- `backend/modules/workforce-facility/routes/userRoutes.js`

---

### 2. ✅ Login Attempts Always Showing 0 (Fixed)
**Issue**: `loginAttempts` field remained 0 for all users regardless of failed login attempts.

**Root Cause**: Login controller wasn't calling the User model's `incLoginAttempts()` and `resetLoginAttempts()` methods.

**Fixes Applied**:
1. Added account lock check before login attempt (returns HTTP 423 if locked)
2. Call `await user.incLoginAttempts()` on failed password validation
3. Call `await user.resetLoginAttempts()` on successful login (replaces manual `lastLogin` update)

**Test Results**:
- ✅ Failed login increments loginAttempts correctly
- ✅ After 5 failed attempts, account locks automatically
- ✅ Locked account returns HTTP 423 with proper error message
- ✅ Successful login resets loginAttempts to 0

**Files Modified**:
- `backend/modules/auth/controllers/WorkingAuthController.js`

---

### 3. ✅ Phone Number Not Displaying in User Exports (Fixed)
**Issue**: Individual user report exports showed "N/A" for phone numbers even though phone data existed.

**Root Cause**: Phone numbers are stored in role-specific collections (Technician, Doctor, etc.) but the export endpoint only read from the base `User.phone` field which was often empty.

**Solution**: Updated `exportUserData` to query role-specific collection and merge phone data.

**Role-Specific Phone Field Mapping**:
| Role | Collection | Phone Field |
|------|-----------|-------------|
| Technician | `technicians` | `phone` |
| Doctor | `doctors` | `officePhone` |
| LabSupervisor | `lab_supervisors` | `officePhone` |
| LabStaff | `lab_staff` | _(extension only)_ |
| InventoryManager | `inventory_managers` | `officePhone` |
| Administrator | `administrators` | `officePhone` |
| Patient | `patients` | `phone` |
| Pharmacist | `pharmacists` | _(extension only)_ |

**Additional Benefits**:
- Also returns role-specific fields (specialty, skills, license number, department, etc.)
- Gracefully handles missing role documents

**Test Results**:
- ✅ Technician export shows phone: "32770395183"
- ✅ Doctor export shows phone: "0703881351"
- ✅ Additional role data included in export

**Files Modified**:
- `backend/modules/workforce-facility/controllers/UserReportsController.js`

---

### 4. ✅ Login Activity Chart Not Working Properly (Fixed)
**Issue**: Login activity chart wasn't displaying real login data correctly.

**Root Causes**:
1. Date normalization issue - comparing UTC timestamps with local date buckets caused mismatches
2. Using `getTime() - i * 24 * 60 * 60 * 1000` for date calculations wasn't consistent with `setDate()` logic
3. Missing debug logging made troubleshooting difficult

**Fixes Applied**:
1. **Improved date normalization**:
   - Normalize both bucket dates and login event dates to start of day (`setHours(0, 0, 0, 0)`)
   - Use consistent date arithmetic with `setDate(getDate() - i)` instead of timestamp subtraction
   - Properly match login events to buckets using `toDateString()` keys

2. **Added comprehensive console logging**:
   - Log data reception status
   - Log number of events extracted
   - Log sample event timestamps
   - Log aggregation results and total login counts
   - Helps diagnose data flow issues

3. **Better empty data handling**:
   - Return zero-filled buckets instead of sample/mock data when no events exist
   - Clear warnings when no data is provided

**Technical Details**:
```javascript
// Before (inconsistent):
const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

// After (consistent):
const day = new Date(now);
day.setHours(0, 0, 0, 0);
day.setDate(day.getDate() - i);

// Login event normalization:
const loginDay = new Date(loginDate);
loginDay.setHours(0, 0, 0, 0);
const dateKey = loginDay.toDateString();
```

**Files Modified**:
- `frontend/src/features/equipment-maintenance/components/reports/UserActivityChart.jsx`

---

## Testing Verification

### Backend API Tests
```powershell
# Test 1: Verify lastLogin in users list
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Get
# ✅ lastLogin field present for logged-in users

# Test 2: Verify phone number in export
Invoke-RestMethod -Uri "http://localhost:5000/api/users/USR-0007/export" -Method Get
# ✅ Phone: "32770395183" (from Technician collection)

# Test 3: Verify login attempts increment
# Make failed login → Check export → loginAttempts: 1 ✅
# Make 4 more failed logins → Check export → loginAttempts: 5, isLocked: true ✅

# Test 4: Verify login events endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/users/reports/login-events" -Method Get
# ✅ Returns array of {user_id, timestamp} objects
```

### Frontend Tests
1. Open reports page
2. Check Users Data Table:
   - ✅ Last Login column shows formatted timestamps
3. Check Login Traffic Chart:
   - ✅ Shows real login data (not sample/mock data)
   - ✅ Day/Week/Month toggles work correctly
   - ✅ Hover tooltip shows correct login counts

---

## Files Changed Summary

### Backend
1. `backend/modules/auth/controllers/WorkingAuthController.js`
   - Added account lock check
   - Call incLoginAttempts() on failed login
   - Call resetLoginAttempts() on successful login

2. `backend/modules/workforce-facility/routes/userRoutes.js`
   - Added lastLogin to user list select fields

3. `backend/modules/workforce-facility/controllers/UserReportsController.js`
   - Updated exportUserData() to fetch role-specific phone data
   - Added role-specific data merging for all user roles

### Frontend
1. `frontend/src/api/userReportsApi.js`
   - Added exportUserData(userId) function

2. `frontend/src/features/equipment-maintenance/components/reports/UserActivityChart.jsx`
   - Fixed date normalization for week/month aggregation
   - Added comprehensive console logging
   - Improved empty data handling

---

## Security Improvements

### Account Lockout Protection
- **Threshold**: 5 failed attempts
- **Lockout Duration**: 15 minutes
- **HTTP Status**: 423 (Locked)
- **Auto-reset**: On successful login
- **Expiration**: Lock automatically expires after 15 minutes

---

## Performance Notes

### User Export with Role Data
- **Cost**: One additional query per export (to role collection)
- **Optimization**: Queries only specific fields needed
- **Fallback**: Graceful handling if role document missing
- **Caching**: Consider implementing caching for frequently accessed exports

### Login Events Aggregation
- **Client-side**: Currently aggregates in browser
- **Scale concern**: May become slow with thousands of login events
- **Future enhancement**: Add server-side aggregation endpoint with pre-computed buckets

---

## Recommendations

### Immediate
1. ✅ All critical fixes implemented and tested

### Short-term
1. Add server-side aggregation for login events (for better performance at scale)
2. Add pagination to login events endpoint
3. Cache role-specific data in User document (denormalization) for faster exports

### Long-term
1. Add background job to pre-compute report metrics
2. Implement Redis caching for frequently accessed reports
3. Add comprehensive integration tests for reports endpoints

---

## Breaking Changes
None - All changes are backward compatible.

---

## Migration Notes
No database migration required. All fixes work with existing data.

---

## Known Limitations

1. **Login Events**: Client-side aggregation may be slow with 10,000+ events
   - **Workaround**: Add date filters to limit data range
   
2. **Role Data**: Extra query per user export
   - **Impact**: Minimal for typical usage (< 100 exports/minute)
   
3. **Timezone**: Chart uses browser local time
   - **Note**: Consistent with user expectations for daily activity views

---

## Support & Troubleshooting

### Chart shows "No data"
1. Check browser console for "UserActivityChart" logs
2. Verify login events endpoint returns data
3. Check date range - events must be within last 24h/7d/30d

### Phone still shows "N/A"
1. Verify role-specific document exists for user
2. Check field name matches role mapping table above
3. Verify phone field is populated in role document

### Login attempts not resetting
1. Check that successful login returns HTTP 200
2. Verify `resetLoginAttempts()` is called (check server logs)
3. Refresh user export to see updated value

---

**Status**: All fixes deployed and tested ✅
**Next Review**: Consider performance optimization for large-scale deployments
