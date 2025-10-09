# NIC-Based Diagnose & Prescription Workflow

## Overview
This document describes the updated workflow that links patient appointments to prescriptions using the patient's National Identity Code (NIC). The NIC becomes the authoritative key for:
- Capturing the patient's identity when booking an appointment.
- Prefilling prescription forms when a doctor chooses to Diagnose from the appointments list.
- Validating that a medical record exists before a prescription is created.
- Aggregating longitudinal patient history (medical record + prescriptions) via a unified NIC.

## Data Flow
1. Patient books appointment using `AddAppointments` form.
   - A new input field `patient_nic` is required.
   - Backend stores this in the `PatientAppointment` (schema field: `patient_nic`).
2. Doctor views appointments in `DoctorAppointmentsPage`.
   - Each active appointment row now includes a `Diagnose` button.
   - Clicking the button navigates to `/prescription/add` carrying `appointmentId`, `patientNic`, and `patientName` in navigation state.
3. Prescription creation (`AddPrescription`):
   - If navigation state supplies a NIC, the Patient ID selector is replaced by a locked read-only field showing the NIC.
   - An appointment badge (last 6 chars of ID) is displayed beside Doctor Name.
   - Before submission, the UI calls `GET /medical_records/history/:nic` to ensure a medical record exists.
     - `404` => Block submission and alert user to create the medical record first.
     - Any other error => Block to avoid orphan prescriptions.
   - On success, the prescription is saved with `patient_ID = NIC` (no separate appointment linkage stored per current requirement).
4. Patient history aggregation (`/medical_records/history/:nic`) collects:
   - Medical Record (patient demographic + clinical fields).
   - Prescriptions filtered by the same NIC.

## Updated Files
Frontend:
- `AddAppointments.jsx`: Added `patient_nic` field and submission logic.
- `DoctorAppointmentsPage.jsx`: Added Diagnose button + navigation state.
- `AddPrescription.jsx`: Prefill NIC, lock field, appointment badge, medical record existence check.

Backend:
- `modules/patient-interaction/models/Appointments.js`: Added `patient_nic` schema field.
- `modules/patient-interaction/routes/appointments.js`: Accept & persist `patient_nic`; include in creation response.

Documentation:
- `docs/nic-diagnose-workflow.md` (this file).

## API Touchpoints
- POST `/appointment/add` — now accepts optional `patient_nic`.
- GET `/medical_records/history/:patientId` — used as existence validator.
- POST `/prescription/add` — unchanged payload shape, but `patient_ID` now can be a NIC string.

## Edge Cases & Considerations
- Legacy appointments without `patient_nic`: Diagnose button falls back to `patient_id` (still passed as NIC if missing NIC).
- If the patient record is created after booking but before diagnosis, history check will pass.
- If the NIC is mistyped at appointment time, prescription linkage & history will fragment. Consider future enhancement: allow inline correction before first prescription.
- No schema-level requirement added yet to make `patient_nic` mandatory to preserve backward compatibility. Can be elevated later.

## Future Enhancements (Optional)
- Add server-side validation to reject prescriptions when no corresponding medical record exists.
- Persist `appointment_id` on prescriptions for audit trail.
- Add NIC normalization/validation (format regex, checksum, etc.).
- Provide inline Medical Record creation modal when missing (doctor workflow).

## Quick QA Checklist
- [x] Book appointment with NIC => stored in DB.
- [x] Diagnose button passes NIC to AddPrescription.
- [x] AddPrescription shows locked NIC field.
- [x] Missing medical record blocks prescription creation.
- [x] Existing medical record allows prescription creation.

---
Last updated: {{DATE}}
