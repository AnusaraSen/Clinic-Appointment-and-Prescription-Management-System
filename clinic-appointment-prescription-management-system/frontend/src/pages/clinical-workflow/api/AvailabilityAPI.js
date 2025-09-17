import axios from "axios";

const API_URL = "http://localhost:5000/api/availability";

// Get availability of a doctor
export const getDoctorAvailability = async (doctorId) => {
  return await axios.get(`${API_URL}/doctor/${doctorId}`);
};

// Add availability (fields: doctorId, date (ISO or YYYY-MM-DD), startTime HH:MM, endTime HH:MM, optional description, optional deviationMinutes (int minutes; +early, -delay))
export const addAvailability = async (data) => {
  console.log("API Call - Adding availability:", data);
  console.log("API URL:", API_URL);
  try {
    const response = await axios.post(API_URL, data);
    console.log("API Success:", response.data);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    console.error("Error Response:", error.response);
    throw error;
  }
};

// Update availability
export const updateAvailability = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// Delete availability
export const deleteAvailability = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

// Test backend connectivity
export const testBackendConnection = async () => {
  try {
    console.log("Testing backend connection...");
    const response = await axios.get("http://localhost:5000/test");
    console.log("Backend test response:", response.data);
    return response;
  } catch (error) {
    console.error("Backend connection test failed:", error);
    throw error;
  }
};
