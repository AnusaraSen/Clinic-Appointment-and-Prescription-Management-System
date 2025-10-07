import axios from 'axios';

const BASE = 'http://localhost:5000/api/medicines';

const client = axios.create({ baseURL: BASE, timeout: 10000 });

const medicineInventoryApi = {
  async list() {
    const res = await client.get('/');
    return Array.isArray(res.data)
      ? res.data
      : (res.data?.data || res.data?.items || []);
  },
  async getByName(name) {
    const res = await client.get('/by-name', { params: { name } });
    return res.data;
  },
  async dispenseByName(name, quantity) {
    const res = await client.post('/dispense-by-name', { name, quantity });
    return res.data;
  },
  async dispenseBulk(items) {
    const res = await client.post('/dispense-bulk', { items });
    return res.data;
  }
};

export default medicineInventoryApi;
