// Patient History API Utilities
// Usage:
//   import { fetchPatientHistory } from '../api/patientHistoryApi';
//   const { patient, prescriptions } = await fetchPatientHistory('200131002258');
//
// Endpoints leveraged:
//   1. GET /patient/history/:patientId (combined)  -> { patient, prescriptions }
//   2. Fallback: GET /patient/get (all patients) + GET /prescription/by-patient/:patientId
// Data shape returned:
//   { patient: {...} | null, prescriptions: [...], source: 'combined' | 'fallback' }
//
// formatPrescription helper normalizes prescription objects for UI consumption.
import axios from 'axios';
import { labTestApi } from './labTestApi';

const BASE_PATIENT = 'http://localhost:5000/patient';
const BASE_PRESCRIPTION = 'http://localhost:5000/prescription';

/**
 * Fetch patient by patient_ID (NIC/code) using history combined endpoint first, fallback to separate calls
 */
export async function fetchPatientHistory(patientId) {
  if (!patientId) throw new Error('patientId is required');
  try {
    // Combined endpoint (patient + prescriptions)
    const { data } = await axios.get(`${BASE_PATIENT}/history/${encodeURIComponent(patientId)}`);
    return {
      patient: data.patient,
      prescriptions: data.prescriptions || [],
      source: 'combined'
    };
  } catch (err) {
    // Fallback: fetch separately
    try {
      const [patientRes, prescriptionsRes] = await Promise.all([
        axios.get(`${BASE_PATIENT}/get`), // original endpoint returns all patients
        axios.get(`${BASE_PRESCRIPTION}/by-patient/${encodeURIComponent(patientId)}`)
      ]);

      const patient = Array.isArray(patientRes.data)
        ? patientRes.data.find(p => p.patient_ID === patientId)
        : null;

      return {
        patient,
        prescriptions: prescriptionsRes.data?.items || [],
        source: 'fallback'
      };
    } catch (fallbackErr) {
      console.error('Failed to fetch patient history (fallback)', fallbackErr);
      throw err; // bubble original
    }
  }
}

export function formatPrescription(p) {
  return {
    id: p._id,
    date: p.Date ? new Date(p.Date) : null,
    diagnosis: p.Diagnosis,
    doctor: p.doctor_Name,
    symptoms: p.Symptoms,
    instructions: p.Instructions,
    medicines: Array.isArray(p.Medicines) ? p.Medicines : []
  };
}

export async function fetchLabReportsByPatient(patientMongoId, fallbackPatientCode) {
  // patientMongoId preferred; if not available, we attempt filtering mock data by code
  if (!patientMongoId && !fallbackPatientCode) return [];
  try {
    if (patientMongoId) {
      const res = await labTestApi.getLabTestsByPatient(patientMongoId);
      const list = res?.data?.labTests || res?.data || [];
      return list.map(t => ({
        id: t._id,
        code: t.labtest_id,
        type: t.type,
        status: t.status,
        priority: t.priorityLevel,
        doctor: t.doctor?.name || t.requestedBy,
        createdAt: t.createdAt,
        reportUrl: t.reportUrl,
        results: t.results,
        notes: t.notes
      }));
    }
  } catch (e) {
    console.warn('Failed to fetch lab tests by patient, attempting fallback', e);
  }
  // Fallback: return empty (could be enhanced to filter all tests by patient code if endpoint absent)
  return [];
}
