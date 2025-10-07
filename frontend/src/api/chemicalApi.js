import axios from 'axios';

const chemicalApi = axios.create({
  baseURL: 'http://localhost:5000/api/chemical-inventory',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

chemicalApi.interceptors.request.use(
  (config) => {
    console.log('Chemical API Request:', config.url);
    return config;
  },
  (err) => Promise.reject(err)
);

chemicalApi.interceptors.response.use(
  (res) => {
    console.log('Chemical API Response:', res.status, res.config?.url);
    return res;
  },
  (err) => {
    console.error('Chemical API Error:', err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);

export default chemicalApi;
