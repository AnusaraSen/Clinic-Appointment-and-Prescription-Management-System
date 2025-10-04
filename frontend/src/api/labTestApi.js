import axios from "axios";

const LabTestAPI = axios.create({
  baseURL: "http://localhost:5000/api/lab-tests",
  timeout: 10000, // Increased timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
LabTestAPI.interceptors.request.use(
  (config) => {
    console.log("🚀 Making request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
LabTestAPI.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error("❌ Response interceptor error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });
    return Promise.reject(error);
  }
);

// Mock data for when backend is unavailable
const mockLabTests = [
  {
    _id: "6751b7b8f82ea7123b4cde9a",
    labtest_id: "LT-2024-001",
    type: "Blood Sugar Test",
    patient: {
      _id: "68cbc3b520d57431cbc097bb",
      name: "John Doe",
      email: "john.doe@email.com",
      patient_id: "P001",
      age: "35"
    },
    doctor: {
      _id: "68b2e51e8ec1571a1d749e4c",
      name: "Dr. Sarah Wilson",
      specialization: "General Medicine",
      department: "Internal Medicine"
    },
    labAssistant: {
      _id: "68b2e51e8ec1571a1d749e4d",
      name: "Dr. Robert Chen",
      department: "Clinical Chemistry"
    },
    status: "Pending",
    priorityLevel: "Urgent",
    sampleType: "Blood",
    instructions: "Fast for 12 hours before test",
    specialInstructions: "Handle with care - urgent case",
    estimatedTime: "2-3 hours",
    requestedBy: "Dr. Sarah Wilson",
    equipments: [
      { name: "Blood Glucose Meter", status: "Available", category: "Blood Analysis" },
      { name: "Centrifuge", status: "In Use", category: "Sample Processing" }
    ],
    notes: "Diabetes screening",
    urgentReason: "Patient showing symptoms of diabetes",
    clinicalFindings: "Patient reports increased thirst and frequent urination",
    results: "",
    reportUrl: "",
    collectedDate: new Date().toISOString(),
    estimatedCompletionTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: "68cbc4aa20d57431cbc09819",
    labtest_id: "LT001",
    type: "Complete Blood Count",
    patient: {
      _id: "68cbc3b520d57431cbc097bb",
      name: "John Doe",
      email: "john.doe@email.com",
      patient_id: "P001",
      age: "35"
    },
    doctor: {
      _id: "68b2e51e8ec1571a1d749e4c", 
      name: "Dr. Sarah Wilson",
      specialization: "General Medicine",
      department: "Internal Medicine"
    },
    labAssistant: {
      _id: "s1",
      name: "Lisa Adams",
      department: "Hematology"
    },
    status: "Pending",
    priorityLevel: "Medium",
    sampleType: "Blood",
    instructions: "Fasting required for 12 hours",
    specialInstructions: "Patient should fast for 8 hours",
    estimatedTime: "2-3 hours",
    requestedBy: "Dr. Sarah Wilson",
    equipments: [
      { name: "Hematology Analyzer", status: "Available", category: "Blood Analysis" },
      { name: "Blood Collection Tubes", status: "Available", category: "Consumables" }
    ],
    notes: "Regular checkup requested",
    urgentReason: "",
    clinicalFindings: "Patient appears healthy",
    results: "",
    reportUrl: "",
    collectedDate: null,
    estimatedCompletionTime: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: "68cbc4aa20d57431cbc09820",
    labtest_id: "LT002",
    type: "Lipid Profile", 
    patient: {
      _id: "68cbc3b520d57431cbc097bc",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      patient_id: "P002",
      age: "42"
    },
    doctor: {
      _id: "68b2e51e8ec1571a1d749e4d",
      name: "Dr. Robert Chen", 
      specialization: "Cardiology",
      department: "Cardiology"
    },
    labAssistant: {
      _id: "s2",
      name: "Mark Wilson",
      department: "Clinical Chemistry"
    },
    status: "In Progress",
    priorityLevel: "High",
    sampleType: "Blood",
    instructions: "Patient should fast for 12 hours",
    specialInstructions: "Monitor for allergic reactions",
    estimatedTime: "4-6 hours",
    requestedBy: "Dr. Robert Chen",
    equipments: [
      { name: "Chemistry Analyzer", status: "Available", category: "Blood Analysis" },
      { name: "Serum Tubes", status: "Available", category: "Consumables" }
    ],
    notes: "Cardiac risk assessment",
    urgentReason: "",
    clinicalFindings: "Elevated cholesterol risk",
    results: "",
    reportUrl: "",
    collectedDate: new Date().toISOString(),
    estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: "68cbc4aa20d57431cbc09821",
    labtest_id: "LT003",
    type: "Urine Analysis",
    patient: {
      _id: "68cbc3b520d57431cbc097bd",
      name: "Mike Johnson", 
      email: "mike.johnson@email.com",
      patient_id: "P003",
      age: "28"
    },
    doctor: {
      _id: "68b2e51e8ec1571a1d749e4c",
      name: "Dr. Sarah Wilson",
      specialization: "General Medicine",
      department: "Internal Medicine"
    },
    labAssistant: {
      _id: "s3",
      name: "Jane Davis",
      department: "Microbiology"
    },
    status: "Completed",
    priorityLevel: "Urgent",
    sampleType: "Urine",
    instructions: "Mid-stream clean catch sample",
    specialInstructions: "Collect first morning sample",
    estimatedTime: "1-2 hours",
    results: "Normal parameters within range",
    notes: "All values normal",
    requestedBy: "Dr. Sarah Wilson",
    equipments: [
      { name: "Urine Analyzer", status: "Available", category: "Urine Analysis" },
      { name: "Urine Collection Cup", status: "Available", category: "Consumables" }
    ],
    urgentReason: "Suspected UTI",
    clinicalFindings: "No abnormalities detected",
    reportUrl: "/reports/lab_test_LT003.pdf",
    collectedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedCompletionTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: "1",
    labtest_id: "LT004",
    type: "Blood Glucose",
    patient: {
      _id: "p1",
      name: "John Doe",
      email: "john.doe@email.com", 
      patient_id: "P001",
      age: "35"
    },
    doctor: {
      _id: "d2",
      name: "Dr. Robert Chen",
      specialization: "Cardiology",
      department: "Cardiology"
    },
    labAssistant: null,
    status: "Pending",
    priorityLevel: "Low",
    sampleType: "Blood",
    instructions: "Random glucose test",
    estimatedTime: "30 minutes",
    requestedBy: "Dr. Robert Chen",
    equipments: [
      { name: "Glucose Meter", status: "Available", category: "Blood Analysis" }
    ],
    notes: "Routine diabetes screening",
    specialInstructions: "",
    urgentReason: "",
    clinicalFindings: "",
    results: "",
    reportUrl: "",
    collectedDate: null,
    estimatedCompletionTime: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: "2",
    labtest_id: "LT005",
    type: "Liver Function Test",
    patient: {
      _id: "p4",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      patient_id: "P004",
      age: "45"
    },
    doctor: {
      _id: "d1",
      name: "Dr. Sarah Wilson",
      specialization: "General Medicine",
      department: "Internal Medicine"
    },
    labAssistant: {
      _id: "s4",
      name: "Robert Chen",
      department: "Immunology"
    },
    status: "In Progress",
    priorityLevel: "High",
    sampleType: "Blood",
    instructions: "Fasting for 8 hours required",
    specialInstructions: "No alcohol 24 hours prior",
    estimatedTime: "3-4 hours",
    requestedBy: "Dr. Sarah Wilson",
    equipments: [
      { name: "Chemistry Analyzer", status: "Available", category: "Blood Analysis" },
      { name: "Serum Separator Tubes", status: "Available", category: "Consumables" }
    ],
    notes: "Routine liver panel",
    urgentReason: "",
    clinicalFindings: "Monitoring liver enzymes",
    results: "",
    reportUrl: "",
    collectedDate: new Date().toISOString(),
    estimatedCompletionTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

const mockStats = {
  pending: 2,
  inProgress: 2,
  completed: 1,
  urgent: 1
};

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Health check function
const healthCheck = async () => {
  try {
    console.log("🔍 Checking backend connectivity...");
    const response = await LabTestAPI.get("/");
    console.log("✅ Backend is reachable!");
    return true;
  } catch (error) {
    console.error("❌ Backend health check failed:", error.message);
    return false;
  }
};

// Lab Test API functions
export const labTestApi = {
  // Test connectivity to backend
  testConnection: async () => {
    try {
      console.log("🔍 Testing backend connectivity...");
      const response = await LabTestAPI.get("/");
      console.log("✅ Backend connection successful!");
      return { success: true, message: "Backend is reachable", data: response.data };
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      return { success: false, message: error.message, error };
    }
  },
  // Get all lab tests with filtering and search
  getAllLabTests: async (params = {}) => {
    // If forceMock is true, skip backend and use mock data directly
    if (params.forceMock) {
      console.log("Force using mock data");
      
      // Apply filtering to mock data
      let filteredTests = [...mockLabTests];
      
      if (params.status && params.status !== 'All') {
        filteredTests = filteredTests.filter(test => test.status === params.status);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredTests = filteredTests.filter(test => 
          test.labtest_id.toLowerCase().includes(searchLower) ||
          test.type.toLowerCase().includes(searchLower) ||
          test.patient.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Simulate API delay
      await delay(200);
      
      return {
        success: true,
        message: "Mock lab tests retrieved successfully",
        data: {
          labTests: filteredTests,
          stats: mockStats,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: filteredTests.length,
            hasNext: false,
            hasPrev: false
          }
        }
      };
    }
    
    try {
      console.log("Attempting to fetch lab tests from backend...");
      const response = await LabTestAPI.get("/", { params });
      console.log("Backend response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Backend error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      console.warn("Backend unavailable, using mock data:", error.message);
      
      // Apply filtering to mock data
      let filteredTests = [...mockLabTests];
      
      if (params.status && params.status !== 'All') {
        filteredTests = filteredTests.filter(test => test.status === params.status);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredTests = filteredTests.filter(test => 
          test.labtest_id.toLowerCase().includes(searchLower) ||
          test.type.toLowerCase().includes(searchLower) ||
          test.patient.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Simulate API delay
      await delay(500);
      
      return {
        success: true,
        message: "Mock lab tests retrieved successfully",
        data: {
          labTests: filteredTests,
          stats: mockStats,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: filteredTests.length,
            hasNext: false,
            hasPrev: false
          }
        }
      };
    }
  },

  // Get lab test by ID
  getLabTestById: async (id) => {
    try {
      console.log("Attempting to fetch lab test from backend with ID:", id);
      const response = await LabTestAPI.get(`/${id}`);
      console.log("Backend response for getLabTestById:", response.data);
      return response.data;
    } catch (error) {
      console.error("Backend error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      console.warn("Backend unavailable, using mock data:", error.message);
      console.log("Searching for lab test with ID:", id);
      
      // Try to find by _id first, then by labtest_id
      let mockTest = mockLabTests.find(test => test._id === id);
      
      if (!mockTest) {
        // Try to find by labtest_id if not found by _id
        mockTest = mockLabTests.find(test => test.labtest_id === id);
      }
      
      await delay(300);
      
      if (mockTest) {
        console.log("Found mock test:", mockTest);
        return {
          success: true,
          message: "Mock lab test retrieved successfully",
          data: { labTest: mockTest }
        };
      } else {
        console.error("Lab test not found in mock data for ID:", id);
        console.log("Available mock test IDs:", mockLabTests.map(t => ({ _id: t._id, labtest_id: t.labtest_id })));
        
        // Return error response instead of creating fake data
        return {
          success: false,
          message: `Lab test not found. The test ID '${id}' does not exist in the system. Please check the ID and try again.`,
          error: "NOT_FOUND",
          data: null,
          availableIds: mockLabTests.map(t => t._id)
        };
      }
    }
  },

  // Create new lab test
  createLabTest: async (data) => {
    try {
      console.log("🚀 Attempting to create lab test via frontend API...");
      console.log("📊 Data being sent:", JSON.stringify(data, null, 2));
      console.log("🌐 Making request to:", LabTestAPI.defaults.baseURL);
      
      const response = await LabTestAPI.post("/", data);
      console.log("✅ Lab test creation successful!");
      console.log("📥 Response received:", JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error("❌ Lab test creation failed!");
      console.error("🔍 Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      
      // If it's a network error, provide more specific guidance
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error("🌐 Network Error: Backend server might not be running on port 5000");
        console.error("💡 Make sure the backend server is started with 'npm start' in the backend directory");
      }
      
      console.warn("🔄 Backend unavailable, simulating creation with mock data...");
      
      // Simulate creation with mock data
      const newTest = {
        _id: String(mockLabTests.length + 1),
        labtest_id: data.labtest_id || `LT${String(mockLabTests.length + 1).padStart(3, '0')}`,
        ...data,
        status: data.status || "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockLabTests.push(newTest);
      await delay(500);
      
      console.log("🎭 Mock lab test created:", newTest);
      
      return {
        success: true,
        message: "Mock lab test created successfully (Backend unavailable)",
        data: { labTest: newTest }
      };
    }
  },

  // Update lab test
  updateLabTest: async (id, data) => {
    try {
      console.log("🔄 Attempting to update lab test via frontend API...");
      console.log("🆔 Lab test ID:", id);
      console.log("📊 Update data:", JSON.stringify(data, null, 2));
      console.log("🌐 Making request to:", `${LabTestAPI.defaults.baseURL}/${id}`);
      console.log("🌐 Full URL:", `${LabTestAPI.defaults.baseURL}/${id}`);
      
      // Add a small delay to ensure server is ready
      await delay(100);
      
      const response = await LabTestAPI.put(`/${id}`, data);
      console.log("✅ Lab test update successful!");
      console.log("📥 Response received:", JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error("❌ Lab test update failed!");
      console.error("🔍 Detailed error information:");
      console.error("  - Error name:", error.name);
      console.error("  - Error message:", error.message);
      console.error("  - Error code:", error.code);
      console.error("  - Response status:", error.response?.status);
      console.error("  - Response statusText:", error.response?.statusText);
      console.error("  - Response data:", error.response?.data);
      console.error("  - Request URL:", error.config?.url);
      console.error("  - Request method:", error.config?.method);
      console.error("  - Request baseURL:", error.config?.baseURL);
      console.error("  - Request headers:", error.config?.headers);
      
      // Check if this is a network connectivity issue
      if (error.code === 'ECONNREFUSED') {
        console.error("🌐 Connection refused - backend server is not responding");
        throw new Error("Cannot connect to server. The backend server on port 5000 is not responding.");
      }
      
      if (error.message.includes('Network Error')) {
        console.error("🌐 Network Error - check connection");
        throw new Error("Network error. Please check your internet connection and ensure the backend server is running.");
      }
      
      if (error.code === 'ENOTFOUND') {
        console.error("🌐 Host not found - DNS resolution failed");
        throw new Error("Cannot resolve localhost. Please check your network configuration.");
      }
      
      // If it's a 404 error, the lab test doesn't exist
      if (error.response?.status === 404) {
        console.error("🔍 Lab test not found in backend database");
        throw new Error(`Lab test with ID ${id} not found in the database. It may have been deleted.`);
      }
      
      // If it's a validation error, show the specific message
      if (error.response?.status === 400) {
        console.error("📝 Validation error from backend");
        throw new Error(`Validation error: ${error.response.data?.message || error.message}`);
      }
      
      // If it's a server error
      if (error.response?.status >= 500) {
        console.error("� Server error from backend");
        throw new Error(`Server error: ${error.response.data?.message || 'Internal server error'}`);
      }
      
      // For any other error, don't fall back to mock data - report the real issue
      console.error("❓ Unknown error occurred:", error);
      throw new Error(`Update failed: ${error.message}. Please check the console for more details.`);
    }
  },

  // Delete lab test
  deleteLabTest: async (id) => {
    try {
      const response = await LabTestAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, simulating deletion:", error.message);
      
      const testIndex = mockLabTests.findIndex(test => test._id === id);
      if (testIndex !== -1) {
        mockLabTests.splice(testIndex, 1);
        await delay(300);
        
        return {
          success: true,
          message: "Mock lab test deleted successfully"
        };
      } else {
        throw new Error("Lab test not found in mock data");
      }
    }
  },

  // Update lab test status
  updateLabTestStatus: async (id, data) => {
    try {
      console.log("🔄 Attempting to update lab test status via frontend API...");
      console.log("🆔 Lab test ID:", id);
      console.log("📊 Status update data:", JSON.stringify(data, null, 2));
      
      const response = await LabTestAPI.patch(`/${id}/status`, data);
      console.log("✅ Lab test status update successful!");
      console.log("📥 Response received:", JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error("❌ Lab test status update failed!");
      console.error("🔍 Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // If it's a network error, provide more specific guidance
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error("Cannot connect to server. Please check if the backend is running on port 5000.");
      }
      
      // If it's a 404 error, the lab test doesn't exist
      if (error.response?.status === 404) {
        throw new Error(`Lab test with ID ${id} not found. It may have been deleted.`);
      }
      
      console.warn("🔄 Backend unavailable, attempting mock status update...");
      
      const testIndex = mockLabTests.findIndex(test => test._id === id);
      if (testIndex !== -1) {
        mockLabTests[testIndex] = { ...mockLabTests[testIndex], ...data, updatedAt: new Date().toISOString() };
        await delay(300);
        
        console.log("🎭 Mock status update successful:", mockLabTests[testIndex]);
        return {
          success: true,
          message: "Mock lab test status updated successfully (Backend unavailable)",
          data: { labTest: mockLabTests[testIndex] }
        };
      } else {
        console.error("❌ Lab test not found in mock data either");
        throw new Error(`Lab test with ID ${id} not found. This lab test may have been created in the database but is not available in offline mode. Please ensure the backend server is running.`);
      }
    }
  },

  // Assign staff to lab test
  assignStaffToLabTest: async (id, data) => {
    try {
      const response = await LabTestAPI.patch(`/${id}/assign`, data);
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, simulating staff assignment:", error.message);
      await delay(300);
      
      return {
        success: true,
        message: "Mock staff assignment completed successfully",
        data: {
          labTest: {
            _id: id,
            assignedStaff: data.staffId,
            priority: data.priority,
            assignmentNotes: data.notes,
            assignedAt: new Date().toISOString()
          }
        }
      };
    }
  },

  // Get available staff
  getAvailableStaff: async () => {
    try {
      const response = await LabTestAPI.get("/staff/available");
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using mock staff data:", error.message);
      await delay(200);
      
      return {
        success: true,
        message: "Mock staff data retrieved successfully",
        data: {
          labStaff: [
            { 
              _id: "s1", 
              name: "Lisa Adams", 
              role: "Lab Assistant",
              specialization: "Hematology",
              availability: "Available",
              currentWorkload: 3
            },
            { 
              _id: "s2", 
              name: "Mark Wilson", 
              role: "Lab Assistant",
              specialization: "Clinical Chemistry", 
              availability: "Available",
              currentWorkload: 2
            },
            { 
              _id: "s3", 
              name: "Jane Davis", 
              role: "Lab Assistant",
              specialization: "Microbiology",
              availability: "Available", 
              currentWorkload: 4
            },
            { 
              _id: "s4", 
              name: "Robert Chen", 
              role: "Senior Lab Assistant",
              specialization: "Immunology",
              availability: "Available",
              currentWorkload: 1
            },
            { 
              _id: "s5", 
              name: "Sarah Johnson", 
              role: "Lab Technician",
              specialization: "Molecular Diagnostics",
              availability: "Busy",
              currentWorkload: 5
            }
          ]
        }
      };
    }
  },

  // Get lab tests by patient
  getLabTestsByPatient: async (patientId, params = {}) => {
    try {
      const response = await LabTestAPI.get(`/patient/${patientId}`, { params });
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using mock patient data:", error.message);
      const patientTests = mockLabTests.filter(test => test.patient._id === patientId);
      await delay(300);
      
      return {
        success: true,
        message: "Mock patient lab tests retrieved",
        data: { labTests: patientTests }
      };
    }
  },

  // Get lab tests by doctor
  getLabTestsByDoctor: async (doctorId, params = {}) => {
    try {
      const response = await LabTestAPI.get(`/doctor/${doctorId}`, { params });
      return response.data;
    } catch (error) {
      console.warn("Backend unavailable, using mock doctor data:", error.message);
      const doctorTests = mockLabTests.filter(test => test.doctor._id === doctorId);
      await delay(300);
      
      return {
        success: true,
        message: "Mock doctor lab tests retrieved", 
        data: { labTests: doctorTests }
      };
    }
  }
};

// Debug helper - can be called from browser console
window.debugLabTestAPI = {
  testConnection: async () => {
    try {
      console.log("🔍 Testing connection from browser...");
      const response = await LabTestAPI.get("/");
      console.log("✅ Connection successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Connection failed:", error);
      throw error;
    }
  },
  
  testUpdate: async (id = "68cc5210bb0bda4682a17320") => {
    try {
      console.log("🔍 Testing update from browser...");
      const updateData = { 
        type: "Browser Test Update", 
        notes: "Updated from browser console",
        priorityLevel: "Medium"
      };
      const response = await LabTestAPI.put(`/${id}`, updateData);
      console.log("✅ Update successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Update failed:", error);
      throw error;
    }
  },
  
  getSpecific: async (id = "68cc5210bb0bda4682a17320") => {
    try {
      console.log("🔍 Testing get specific from browser...");
      const response = await LabTestAPI.get(`/${id}`);
      console.log("✅ Get successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Get failed:", error);
      throw error;
    }
  }
};

export default LabTestAPI;
