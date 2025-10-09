import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api/pharmacy-dashboard' });

export default {
  summary: () => api.get('/summary'),
};
