import axios from "axios";

const labApi = axios.create({
  baseURL: "http://localhost:5000/api/lab-inventory",
  timeout: 10000, // Increased timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for debugging
labApi.interceptors.request.use(
  (config) => {
    console.log('Lab Inventory API Request:', config);
    return config;
  },
  (error) => {
    console.error('Lab Inventory API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
labApi.interceptors.response.use(
  (response) => {
    console.log('Lab Inventory API Response:', response);
    return response;
  },
  (error) => {
    console.error('Lab Inventory API Response Error:', error);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default labApi;