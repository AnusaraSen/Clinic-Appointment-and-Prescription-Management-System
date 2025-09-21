import axios from "axios";

const prescriptionApi = axios.create({
  baseURL: "http://localhost:5000/api/prescriptions",
  headers: { "Content-Type": "application/json" }
});

// Dispense medicines for a prescription
export const dispenseMedicines = async (prescriptionId, dispensingData) => {
  try {
    const response = await prescriptionApi.post(`/${prescriptionId}/dispense`, dispensingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all prescriptions
export const getAllPrescriptions = async (filters = {}) => {
  try {
    const response = await prescriptionApi.get('/', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get prescription by ID
export const getPrescriptionById = async (prescriptionId) => {
  try {
    const response = await prescriptionApi.get(`/${prescriptionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update prescription
export const updatePrescription = async (prescriptionId, updateData) => {
  try {
    const response = await prescriptionApi.put(`/${prescriptionId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default prescriptionApi;