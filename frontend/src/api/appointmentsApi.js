import axios from 'axios';

// Base URL for appointments (patient-interaction module)
// Adjust if your backend is namespaced differently.
// NOTE: In server.js router is mounted twice: /appointment and /appointments (no /api prefix used there)
// Prefer plural for consistency; adjust if you later namespace under /api.
// If backend adds /api, change to http://localhost:5000/api/appointments
const APPOINTMENT_BASE = 'http://localhost:5000/appointments';

/**
 * Fetch appointments for a doctor by date range (inclusive start/end Y-M-D)
 * Falls back to single date if start === end.
 */
export async function getDoctorAppointments({ doctorId, start, end }) {
  if (!doctorId) throw new Error('doctorId is required');
  let url;
  if (start && end) {
    url = `${APPOINTMENT_BASE}/by-doctor/${doctorId}?start=${start}&end=${end}`;
  } else if (start) {
    url = `${APPOINTMENT_BASE}/by-doctor/${doctorId}?date=${start}`;
  } else {
    throw new Error('start (or start+end) required');
  }
  console.debug('[appointmentsApi] Fetching appointments', { url });
  const res = await axios.get(url, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    console.error('[appointmentsApi] Non-JSON response', { url, status: res.status, ct, sample: (res.data||'').toString().slice(0,120) });
    throw new Error('Unexpected non-JSON response when fetching appointments');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Request failed ${res.status}`);
  }
  return res.data; // array of appointments
}

// Fetch by doctor name (fallback) — supports loose (regex/i) matching
export async function getDoctorAppointmentsByName({ doctorName, start, end, loose=false }) {
  if (!doctorName) throw new Error('doctorName is required');
  if (!start) throw new Error('start (or start+end) required');
  let queryPart;
  if (start && end) {
    queryPart = `start=${start}&end=${end}`;
  } else {
    queryPart = `date=${start}`;
  }
  const url = `${APPOINTMENT_BASE}/by-doctor-name/${encodeURIComponent(doctorName)}?${queryPart}${loose?'&loose=1':''}`;
  console.debug('[appointmentsApi] Fetching appointments by name', { url });
  const res = await axios.get(url, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    throw new Error('Non-JSON response for by-name fetch');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Request failed ${res.status}`);
  }
  return res.data;
}

// Fetch all appointments (used as last-resort fallback; returns potentially large array)
export async function getAllAppointments() {
  const url = `${APPOINTMENT_BASE}/`;
  const res = await axios.get(url, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    throw new Error('Non-JSON response for all appointments fetch');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Request failed ${res.status}`);
  }
  return res.data;
}

// Fetch only authenticated patient's appointments (requires Authorization header set globally or per request)
export async function getMyAppointments() {
  const url = `${APPOINTMENT_BASE}/my`;
  const res = await axios.get(url, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    throw new Error('Non-JSON response for my appointments fetch');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Request failed ${res.status}`);
  }
  return res.data;
}

// Cancel appointment by id
export async function cancelAppointment(id, { reason, actor } = {}) {
  if (!id) throw new Error('id required');
  const url = `${APPOINTMENT_BASE}/cancel/${id}`;
  const res = await axios.patch(url, { reason, actor }, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    throw new Error('Non-JSON response cancelling appointment');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Cancel failed ${res.status}`);
  }
  return res.data;
}

// Update timing deviation (offset in minutes; negative=early, positive=late)
export async function updateAppointmentTiming(id, offsetMinutes) {
  if (!id) throw new Error('id required');
  if (offsetMinutes === undefined || offsetMinutes === null) throw new Error('offsetMinutes required');
  const url = `${APPOINTMENT_BASE}/timing/${id}`;
  const res = await axios.patch(url, { offset_minutes: offsetMinutes }, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    throw new Error('Non-JSON response updating timing');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Timing update failed ${res.status}`);
  }
  return res.data; // { message, appointment: { timing_offset_minutes, timing_status, timing_updated_at } }
}
