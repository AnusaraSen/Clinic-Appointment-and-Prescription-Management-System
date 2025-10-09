import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const getUserReportMetrics = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.role) params.append('role', filters.role);
  const res = await api.get(`/users/reports/metrics?${params.toString()}`);
  return res.data;
};

export const getRegistrationTrend = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  const res = await api.get(`/users/reports/registration-trend?${params.toString()}`);
  return res.data;
};

export const getLoginEvents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.role) queryParams.append('role', params.role);
  try {
    const res = await api.get(`/users/reports/login-events?${queryParams.toString()}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching login events:', err);
    return { success: false, data: [] };
  }
};

export const getAllUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (err) {
    console.error('Error fetching users:', err);
    return { success: false, data: [] };
  }
};

export const exportUserData = async (userId) => {
  try {
    const res = await api.get(`/users/${encodeURIComponent(userId)}/export`);
    return res.data;
  } catch (err) {
    console.error(`Error exporting user ${userId}:`, err);
    return { success: false };
  }
};

export const getUserActivity = async () => ({ success: true, data: [] });
