# Edit Technician Form - Real-Time Validation Guide

## Overview
The Edit Technician form now includes **real-time validation feedback** that shows error messages as users interact with the form fields.

## Visual Feedback Features

### 1. **Border Color Changes**
- ✅ **Valid field**: Blue border on focus (`border-gray-300 focus:ring-blue-500`)
- ❌ **Invalid field**: Red border on focus (`border-red-300 focus:ring-red-500`)

### 2. **Error Messages**
- Appear immediately below the field when validation fails
- Displayed in red text (`text-red-600`)
- Only shown after user has touched/blurred the field

### 3. **Helper Text**
- Shows helpful hints for valid fields
- Replaced by error messages when validation fails

---

## Validated Fields

### Personal Information Section

#### **First Name** (Required)
- **Validation Rules**:
  - Must be at least 2 characters
  - Maximum 50 characters
  - Only letters and spaces allowed
- **Error Messages**:
  - "Name is required"
  - "Name must be at least 2 characters"
  - "Name must not exceed 50 characters"
  - "Name can only contain letters and spaces"
- **Triggers**: onChange + onBlur

#### **Last Name** (Required)
- **Validation Rules**: Same as First Name
- **Error Messages**: Same as First Name
- **Triggers**: onChange + onBlur

#### **Email Address** (Required)
- **Validation Rules**:
  - Must be a valid email format (user@domain.com)
  - Cannot be empty
- **Error Messages**:
  - "Email is required"
  - "Please enter a valid email address"
- **Triggers**: onChange + onBlur
- **Visual**: Mail icon on the left

#### **Phone Number** (Required)
- **Validation Rules**:
  - Must be exactly 10 digits (formatting removed automatically)
  - Non-digit characters are stripped before validation
- **Error Messages**:
  - "Phone number is required"
  - "Phone number must be 10 digits"
- **Helper Text**: "Enter 10 digits (formatting will be removed automatically)"
- **Triggers**: onChange + onBlur
- **Visual**: Phone icon on the left

---

### Employment Information Section

#### **Employee ID** (Required)
- **Validation Rules**:
  - Must follow format: EMP-XXXX (e.g., EMP-1234)
  - Regex pattern: `/^EMP-\d{4}$/`
- **Error Messages**:
  - "Employee ID is required"
  - "Employee ID must be in format: EMP-XXXX"
- **Helper Text**: "Format: T followed by 3 digits (e.g., T123)"
- **Triggers**: onChange + onBlur

#### **Department** (Required)
- **Validation Rules**:
  - Must select a department from dropdown
  - Cannot be empty
- **Error Messages**:
  - "Department is required"
- **Options**:
  - Maintenance
  - IT
  - HVAC
  - Electrical
  - Plumbing
  - Security
- **Triggers**: onChange + onBlur

#### **Location** (Optional)
- **Validation Rules**:
  - Maximum 200 characters if provided
- **Error Messages**:
  - "Location must be less than 200 characters"
- **Triggers**: onChange + onBlur
- **Visual**: MapPin icon on the left

#### **Shift** (Optional)
- **Options**:
  - Morning (6:00 AM - 2:00 PM)
  - Afternoon (2:00 PM - 10:00 PM)
  - Night (10:00 PM - 6:00 AM)
  - Day (8:00 AM - 6:00 PM)
- **Visual**: Clock icon on the left

#### **Availability Status** (Optional)
- **Options**:
  - Available
  - Busy
  - On Leave
  - Off Duty

---

### Additional Details Section

#### **Experience Level** (Optional)
- **Validation Rules**:
  - Must be between 0-50 years if provided
  - Must be a valid number
- **Error Messages**:
  - "Invalid experience level"
- **Triggers**: onChange + onBlur

#### **Hire Date** (Optional)
- **Validation Rules**:
  - Cannot be in the future
  - Must be a valid date
- **Error Messages**:
  - "Date cannot be in the future"
- **Triggers**: onChange + onBlur

#### **Notes** (Optional)
- **Validation Rules**:
  - Maximum 1000 characters
- **Error Messages**:
  - "Notes must be less than 1000 characters"
- **Triggers**: onChange + onBlur

---

### Emergency Contact Section

#### **Contact Name** (Optional)
- **Validation Rules**: Same as First Name (if provided)
- **Error Messages**: Same as First Name
- **Triggers**: onChange + onBlur

#### **Contact Phone** (Optional)
- **Validation Rules**: Same as Phone Number (if provided)
- **Error Messages**: Same as Phone Number
- **Triggers**: onChange + onBlur

#### **Relationship** (Optional)
- No specific validation

---

## Validation Behavior

### When Validation Occurs

1. **On Change (Real-time)**:
   - If field was previously touched and had an error
   - Immediately re-validates to clear error when fixed

2. **On Blur (Field exit)**:
   - Marks field as "touched"
   - Runs validation and shows errors if any

3. **On Submit**:
   - Validates ALL fields
   - Marks all fields as "touched"
   - Prevents submission if any errors exist
   - Shows error banner: "Please fix all validation errors before submitting"

### Visual States

```
Field States:
┌─────────────────────────────────────────────┐
│ UNTOUCHED (Initial)                         │
│ - Normal border (gray)                      │
│ - No error message                          │
│ - Shows helper text                         │
└─────────────────────────────────────────────┘
           │
           ▼ (User types/blurs)
┌─────────────────────────────────────────────┐
│ TOUCHED + VALID                             │
│ - Normal border (gray)                      │
│ - No error message                          │
│ - Shows helper text                         │
└─────────────────────────────────────────────┘
           │
           ▼ (Invalid input detected)
┌─────────────────────────────────────────────┐
│ TOUCHED + INVALID                           │
│ - Red border                                │
│ - Shows error message (red text)            │
│ - Helper text replaced by error             │
└─────────────────────────────────────────────┘
```

---

## Example User Experience

### Scenario: User enters invalid phone number

1. **User clicks on Phone Number field**
   - Field gets blue focus ring
   - Normal state

2. **User types "123"**
   - Input shows "123"
   - No error yet (not blurred)

3. **User clicks outside the field (blur)**
   - Field is marked as "touched"
   - Validation runs: "123" → only 3 digits
   - Border turns red
   - Error message appears: "Phone number must be 10 digits"

4. **User clicks back and adds more digits: "1234567890"**
   - Validation runs immediately (because field was touched and had error)
   - Error clears
   - Border returns to normal
   - Helper text reappears

---

## Form Submission Validation

When user clicks "Update Technician":

1. **All fields marked as touched**
2. **Comprehensive validation runs**
3. **Two possible outcomes**:

   ✅ **All Valid**:
   - Form submits to API
   - Shows loading state: "Updating..."
   - On success: Modal closes, parent updates

   ❌ **Has Errors**:
   - Submission prevented
   - All error messages displayed
   - Red banner at top: "Please fix all validation errors before submitting"
   - Form remains open for corrections

---

## Technical Implementation

### State Management

```javascript
const [formData, setFormData] = useState({ ... });
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
```

### Validation Functions

- **`handleInputChange(e)`**: Updates form data, re-validates if field was touched
- **`handleFieldBlur(e)`**: Marks field as touched, runs validation
- **`validateField(fieldName, value)`**: Field-specific validation logic
- **`validateForm()`**: Validates all fields before submission

### Error Display Pattern

```jsx
<input
  name="firstName"
  value={formData.firstName}
  onChange={handleInputChange}
  onBlur={handleFieldBlur}
  className={`w-full px-3 py-2 border rounded-lg ${
    touched.firstName && errors.firstName
      ? 'border-red-300 focus:ring-red-500'  // Invalid
      : 'border-gray-300 focus:ring-blue-500' // Valid
  }`}
/>
{touched.firstName && errors.firstName && (
  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
)}
```

---

## Benefits

✅ **Immediate Feedback**: Users know instantly when they make an error
✅ **Clear Guidance**: Specific error messages explain what went wrong
✅ **Better UX**: Prevents form submission surprises
✅ **Accessibility**: Error messages are programmatically associated with fields
✅ **Professional**: Visual states match modern form design patterns

---

## Files Modified

- **File**: `frontend/src/features/equipment-maintenance/components/EditTechnicianModal.jsx`
- **Changes**:
  - Added `onBlur` handlers to all validated fields
  - Added conditional border styling (red for errors, gray for normal)
  - Added error message display below each field
  - Preserved helper text that's replaced by errors when validation fails

---

## Testing the Validation

### Manual Test Checklist

- [ ] First Name: Enter "A" → Should show "must be at least 2 characters"
- [ ] Email: Enter "invalid-email" → Should show "valid email address"
- [ ] Phone: Enter "123" → Should show "must be 10 digits"
- [ ] Employee ID: Enter "ABC" → Should show "format: EMP-XXXX"
- [ ] Department: Leave empty → Should show "required" on submit
- [ ] Hire Date: Select future date → Should show "cannot be in the future"
- [ ] Notes: Enter 1500 characters → Should show "must be less than 1000 characters"
- [ ] Submit with errors → Should show banner and prevent submission
- [ ] Fix all errors → Should allow submission

---

Last Updated: October 13, 2025
