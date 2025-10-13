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

export async function fetchLabReportsByPatient(patientMongoId, fallbackPatientCode, fallbackPatientName) {
  // Goal: return all lab tests (aka lab reports) for the patient shown on Doctor's history page.
  // Primary source uses Lab Workflow patient Mongo _id; if unavailable or yields empty, try smart fallbacks.

  const mapTests = (list = []) => (list || []).map(t => ({
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

  // If nothing to go on, bail early
  if (!patientMongoId && !fallbackPatientCode && !fallbackPatientName) return [];

  // Helper to compose all report sources once we know lab patient _id and code
  const gatherAllFor = async (labPatientId, patientCodeForResults) => {
    const axios = (await import('axios')).default;

    // LabTests
    let labTests = [];
    try {
      const res = await labTestApi.getLabTestsByPatient(labPatientId);
      labTests = res?.data?.labTests || res?.data || [];
    } catch (e) { console.warn('LabTests fetch failed', e?.message); }

    // Lab History (LabTasks)
    let labHistory = [];
    try {
      const { data } = await axios.get(`http://localhost:5000/api/patients/${labPatientId}/history`);
      labHistory = data?.history || data?.data?.history || [];
    } catch (e) { console.warn('Lab history fetch failed', e?.message); }

    // Test Results (attachments/PDFs) by patient code
    let testResults = [];
    try {
      const code = patientCodeForResults || fallbackPatientCode || '';
      if (code) {
        const { data } = await axios.get(`http://localhost:5000/api/test-results`, { params: { patientId: code, limit: 100 } });
        testResults = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      }
    } catch (e) { console.warn('Test results fetch failed', e?.message); }

    // Normalize
    const fromTests = mapTests(labTests);
    const fromHistory = (labHistory || []).map(h => ({
      id: h._id,
      code: h.testType,
      type: h.testType,
      status: h.status || 'Completed',
      priority: h.priority || '-',
      doctor: h.technician || '-',
      createdAt: h.date || h.updatedAt || h.createdAt,
      reportUrl: '',
      source: 'LabTask'
    }));
    const fromResults = (testResults || []).map(tr => ({
      id: tr._id || tr.testId,
      code: tr.testId,
      type: tr.testType,
      status: tr.status,
      priority: '-',
      doctor: tr.requestedBy,
      createdAt: tr.completedDate || tr.updatedAt || tr.createdAt,
      reportUrl: Array.isArray(tr.attachments) && tr.attachments[0]?.filePath ? tr.attachments[0].filePath : '',
      source: 'TestResult'
    }));

    // Combine and dedupe by source+id
    const combined = [...fromTests, ...fromHistory, ...fromResults];
    const seen = new Set();
    return combined.filter(r => {
      const key = `${r.source||'LabTest'}:${r.id}`;
      if (seen.has(key)) return false; seen.add(key); return true;
    });
  };

  // 1) Try by direct patient Mongo _id (Lab Workflow patient model)
  try {
    if (patientMongoId) {
      // We also try to fetch the lab patient to get their code for test-results
      const axios = (await import('axios')).default;
      let patientCode = undefined;
      try {
        const { data } = await axios.get(`http://localhost:5000/api/patients/${patientMongoId}`);
        const p = data?.data || data;
        patientCode = p?.patient_id;
      } catch {}
      const all = await gatherAllFor(patientMongoId, patientCode || fallbackPatientCode);
      if (Array.isArray(all) && all.length > 0) return all;
    }
  } catch (e) {
    console.warn('Failed to fetch lab tests by direct patient id; will try fallbacks', e);
  }

  // 2) Fallback: look up Lab Workflow patient by code or name, then fetch tests by that ID
  try {
    const axios = (await import('axios')).default;
    // Try search by code first, then by name
    let candidate = null;
  const base = 'http://localhost:5000/api/patients';

    const trySearch = async (q) => {
      if (!q) return null;
      try {
        // Prefer dedicated search endpoint which filters by name reliably
        const { data } = await axios.get(`${base}/search`, { params: { q } });
        const arr = data?.data || data?.patients || [];
        return Array.isArray(arr) && arr.length ? arr : [];
      } catch (err) {
        console.warn('Patient search failed for', q, err?.message);
        return [];
      }
    };

    // Search by code (exact/contains)
    let results = await trySearch(fallbackPatientCode);
    if (results.length === 0 && fallbackPatientName) {
      results = await trySearch(fallbackPatientName);
    }
    if (results.length > 0) {
      const nameLc = (fallbackPatientName||'').toLowerCase();
      const codeLc = (fallbackPatientCode||'').toLowerCase();
      // Prefer exact code match
      candidate = results.find(p => (p?.patient_id||'').toLowerCase() === codeLc)
               || results.find(p => (p?.name||p?.user?.name||'').toLowerCase() === nameLc)
               || results[0];
    }

    if (candidate?._id) {
      const all2 = await gatherAllFor(candidate._id, candidate.patient_id || fallbackPatientCode);
      if (Array.isArray(all2) && all2.length > 0) return all2;
    }
  } catch (e) {
    console.warn('Fallback lookup by code/name failed; will try mock list filter', e);
  }

  // 3) Final fallback: use mock/all tests and filter by heuristics (patient code or name)
  try {
    const all = await labTestApi.getAllLabTests({ forceMock: true });
    const items = all?.data?.labTests || all?.data || [];
    const nameLc = (fallbackPatientName || '').toLowerCase();
    const codeLc = (fallbackPatientCode || '').toLowerCase();
    const filtered = items.filter(t => {
      const pname = t?.patient?.name?.toLowerCase?.() || '';
      const pid = t?.patient?.patient_id?.toLowerCase?.() || '';
      return (nameLc && pname.includes(nameLc)) || (codeLc && pid.includes(codeLc));
    });
    if (filtered.length > 0) return mapTests(filtered);
  } catch (e) {
    console.warn('Mock fallback for lab tests failed', e);
  }

  // No luck
  return [];
}
