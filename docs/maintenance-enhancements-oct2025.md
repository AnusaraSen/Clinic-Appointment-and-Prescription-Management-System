# Maintenance Notifications & Reports Enhancement

## Date: October 12, 2025

---

## Summary of Changes

### 1. Enhanced Notification Messages for All Staff-Created Requests

**Problem:** Notifications weren't clearly showing who created maintenance requests when non-admin staff created them.

**Solution:** Enhanced notification messages to include reporter name and role.

#### Changes Made in `backend/services/notificationService.js`:

##### A. Regular Maintenance Request Notifications
- ✅ Added reporter name and role extraction
- ✅ Enhanced message to show: `"[Name] ([Role]) created a maintenance request for [Equipment]"`
- ✅ Added metadata fields: `reportedBy` and `reportedByRole`
- ✅ Added detailed console logging to track who created the request

**Before:**
```javascript
message: `A new maintenance request has been created for ${equipment}: ${description}`
```

**After:**
```javascript
message: `${reporterName} (${reporterRole}) created a maintenance request for ${equipment}: ${description}`
```

##### B. Urgent Maintenance Request Notifications
- ✅ Same enhancements for urgent/high-priority requests
- ✅ Message now shows: `"URGENT: [Name] ([Role]) reports [Equipment] requires immediate attention!"`
- ✅ Includes reporter information in metadata

**Impact:**
- Admins now see exactly who created each maintenance request
- Better tracking and accountability
- Clear visibility when any staff member (not just admins) creates requests

---

### 2. Added "Requested By" and "Role" Columns to CSV Reports

**Problem:** CSV export reports didn't show who requested the maintenance, making it hard to track request origins.

**Solution:** Added two new columns to the maintenance request Excel/CSV export.

#### Changes Made in `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js`:

##### A. Added `reportedBy` Population
```javascript
.populate('reportedBy', 'name email role')
```
- Now fetches reporter information when generating reports

##### B. Added Two New Columns
**New columns added (positioned after Status, before Assigned Technician):**
1. **Requested By** - Shows the name (or email if name unavailable) of the person who created the request
2. **Requester Role** - Shows the role (Admin, Technician, etc.) of the person who created the request

##### C. Updated Column Order
The new report structure:
1. Request ID
2. Equipment ID
3. Equipment Name
4. Location
5. Issue Description
6. Priority
7. Status
8. **Requested By** ⬅️ NEW
9. **Requester Role** ⬅️ NEW
10. Assigned Technician
11. Request Date
12. Completed Date
13. Duration (days)

##### D. Data Handling
```javascript
requestedBy: request.reportedBy?.name || request.reportedBy?.email || 'Unknown',
requesterRole: request.reportedBy?.role || 'N/A'
```
- Falls back to email if name is not available
- Shows 'Unknown' if no reporter information
- Shows 'N/A' if role is not available

---

## Benefits

### Notification Improvements
1. ✅ **Better Visibility** - Admins immediately see who created each request
2. ✅ **Improved Accountability** - Clear tracking of request originators
3. ✅ **Role Context** - Knowing the role helps prioritize and understand the request context
4. ✅ **Complete Audit Trail** - Metadata includes reporter info for future reference

### Report Improvements
1. ✅ **Complete Records** - Export includes requester information
2. ✅ **Better Analysis** - Can analyze which departments/roles create most requests
3. ✅ **Compliance** - Full audit trail in exported reports
4. ✅ **Accountability** - Track who initiated each maintenance request

---

## Testing Checklist

### Backend - Notifications
- [ ] Create maintenance request as Admin → Check notification message shows "Admin Name (Admin)"
- [ ] Create maintenance request as Technician → Check notification message shows "Technician Name (Technician)"
- [ ] Create maintenance request as other staff → Check notification message shows correct name and role
- [ ] Create urgent/high priority request → Check URGENT notification includes reporter info
- [ ] Check console logs show reporter name and role
- [ ] Verify notification metadata includes `reportedBy` and `reportedByRole` fields

### Backend - Reports
- [ ] Export maintenance requests report
- [ ] Verify "Requested By" column appears after Status
- [ ] Verify "Requester Role" column appears after "Requested By"
- [ ] Check that all requests show correct requester name
- [ ] Check that all requests show correct role
- [ ] Verify fallback to email works if name is missing
- [ ] Verify 'Unknown' / 'N/A' appears for requests without reporter data

### Frontend
- [ ] Check notification panel shows updated messages with reporter names
- [ ] Download CSV report and verify new columns are present
- [ ] Verify CSV data is correctly formatted

---

## Technical Details

### Files Modified

1. **`backend/services/notificationService.js`**
   - Function: `notifyNewMaintenanceRequest`
   - Function: `notifyUrgentMaintenanceRequest`
   - Added reporter extraction logic
   - Enhanced notification messages
   - Added metadata fields

2. **`backend/modules/workforce-facility/controllers/MaintenanceRequestController.js`**
   - Function: `exportFilteredMaintenanceRequests`
   - Added `.populate('reportedBy', 'name email role')`
   - Added two new columns to worksheet definition
   - Added data mapping for new columns
   - Updated summary row array lengths

### Database Fields Used
- `reportedBy` (Reference to User model)
  - `name` - User's full name
  - `email` - User's email (fallback)
  - `role` - User's role in the system

### Notification Metadata Structure
```javascript
metadata: {
  requestId: string,
  equipmentName: string,
  priority: string,
  reportedBy: string,      // NEW
  reportedByRole: string   // NEW
}
```

---

## Migration Notes

### No Database Migration Required
- All changes use existing database fields
- The `reportedBy` field already exists in MaintenanceRequest model
- No schema changes needed

### Backward Compatibility
- ✅ Old maintenance requests without reporter info will show 'Unknown' / 'N/A'
- ✅ Notification system gracefully handles missing reporter data
- ✅ Export function has fallback values for all fields

---

## Future Enhancements (Optional)

1. **Filter Reports by Requester**
   - Add ability to filter exports by specific staff members or roles

2. **Requester Statistics**
   - Add summary showing requests per person/role in the report footer

3. **Notification Preferences**
   - Allow admins to configure which roles should receive notifications

4. **Email Notifications**
   - Send email notifications to admins for urgent requests from specific roles

---

## Support

For questions or issues:
1. Check console logs for detailed notification creation tracking
2. Verify `reportedBy` field is populated in database
3. Ensure User model has `name`, `email`, and `role` fields
4. Check that requests are being created with valid `reportedBy` reference

---

## Rollback Instructions

If needed, revert these commits:
1. Notification service changes (reporter info in messages)
2. Export controller changes (new columns)

Both changes are independent and can be reverted separately.
