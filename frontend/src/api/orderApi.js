import axios from 'axios';

const orderApi = axios.create({
  baseURL: 'http://localhost:5000/api/orders',
});

export default {
  list: () => orderApi.get('/'),
  get: (id) => orderApi.get(`/${id}`),
  create: (payload) => orderApi.post('/', payload),
  update: (id, payload) => orderApi.put(`/${id}`, payload),
  delete: (id) => orderApi.delete(`/${id}`),
  lowStock: (params) => orderApi.get('/low-stock', { params }),
};
