import axios from 'axios';

const BASE = 'http://localhost:5000/feedback';

// Get feedbacks for a specific appointment
export async function getFeedbackByAppointment(appointmentId) {
  if (!appointmentId) throw new Error('appointmentId is required');
  const url = `${BASE}/by-appointment/${encodeURIComponent(appointmentId)}`;
  const res = await axios.get(url, { validateStatus: s => s < 500 });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    throw new Error('Unexpected response while fetching feedback');
  }
  if (res.status >= 400) {
    throw new Error(res.data?.message || `Request failed ${res.status}`);
  }
  // API may return single object or array; normalize to array
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (data && data.feedback) return Array.isArray(data.feedback) ? data.feedback : [data.feedback];
  return data ? [data] : [];
}
