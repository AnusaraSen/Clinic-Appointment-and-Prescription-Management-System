import axios from 'axios';

// Clinical workflow routes are mounted under /prescription
const api = axios.create({
  baseURL: 'http://localhost:5000/prescription',
});

export default {
  // GET /prescription/get
  list: () => api.get('/get'),
  // GET /prescription/get/:id
  get: (id) => api.get(`/get/${id}`),
  // GET /prescriptions/by-patient/:patientId (alt route in clinical-workflow)
  listByPatient: (patientId) => api.get(`/by-patient/${encodeURIComponent(patientId)}`),
};
