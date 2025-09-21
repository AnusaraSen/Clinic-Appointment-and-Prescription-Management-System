# Validation Rules

Implemented backend & frontend validation for Patients and Prescriptions.

## Patient
Field | Rules
----- | -----
patient_ID | Required; 3–24 chars; regex `^[A-Za-z0-9]+([_-][A-Za-z0-9]+)*$` (no auto-uppercase)
patient_name | Required; 2–60 chars; allowed letters, spaces, period, apostrophe, hyphen
patient_age | Required; integer; 0–120
Gender | Required; one of: Male, Female, Other, Prefer Not To Say (UI currently uses Male/Female)
Email | Required; <=254; basic email format
Emergency_Contact | Required; allowed digits + `+ ( ) - space`; after stripping non-digits length 7–15
Allergies | Optional; <=500 chars; no `<` or `>`
Current_medical_conditions | Optional; <=500 chars; no `<` or `>`
Past_surgeries | Optional; <=500 chars; no `<` or `>`
Blood_group | Optional; enum: A+, A-, B+, B-, AB+, AB-, O+, O-, Not Specified
Smoking_status | Optional; must match slider output (Never, Rarely, Sometimes, Often, Regularly, Heavy) or interim numeric string (0–5) during form state
Alcohol_consumption | Same as Smoking_status
photo | Optional; currently only stored if provided; no strict size/type validation (subject to future enhancement)

## Prescription
Field | Rules
----- | -----
patient_ID | Required; same pattern as patient (no existence/foreign key check presently)
patient_name | Required; 2–60 chars; same name pattern (not auto-matched to record, but patient_ID existence is enforced)
doctor_Name | Required; same pattern as patient_name
Date | Optional; if provided must parse to valid date (future dates allowed per requirement)
Diagnosis | Required; 3–500 chars; no `<` or `>`
Symptoms | Optional; <=500; no `<` or `>`
Instructions | Optional; <=500; no `<` or `>`
Medicines | Array 1–20 items required
Medicines[].Medicine_Name | Required; <=100; no `<` or `>`; unique case-insensitive within prescription
Medicines[].Dosage | Required; <=50
Medicines[].Frequency | Required; <=50
Medicines[].Duration | Required; <=30

## Error Response Format (Backend)
```
HTTP 400
{
  "errors": [
    { "field": "patient_ID", "message": "Patient ID is required" },
    { "field": "Medicines[0].Dosage", "message": "Dosage required" }
  ]
}
```

## Frontend Behavior
- Forms block submission if local validation errors exist.
- Inline messages shown under each field.
- Global alert prompts user to correct errors.
- Duplicate medicine names blocked before submission.

## Deferred / Not Implemented
- Automatic normalization/capitalization of names or IDs.
- Rejecting any future prescription date.
- Photo validation (format regex, size ≤2MB, clearing via empty/null flag).
- Foreign key existence check (patient_ID -> Medical_Records).
- Cross-record duplicate prescription detection per day.

## Maintenance Notes
- Update both `backend/middleware/validation.js` and `frontend/src/utils/validation.js` when adding/changing rules.
- Keep regex and length limits in sync to avoid user confusion.

