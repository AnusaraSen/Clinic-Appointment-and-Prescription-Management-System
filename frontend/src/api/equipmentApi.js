import axios from 'axios';

const equipmentApi = axios.create({
  baseURL: 'http://localhost:5000/api/equipment-inventory',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

equipmentApi.interceptors.request.use(
  (config) => {
    console.log('Equipment API Request:', config.url);
    return config;
  },
  (err) => Promise.reject(err)
);

equipmentApi.interceptors.response.use(
  (res) => {
    console.log('Equipment API Response:', res.status, res.config?.url);
    return res;
  },
  (err) => {
    console.error('Equipment API Error:', err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);

export default equipmentApi;
