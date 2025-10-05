import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/labtasks",
  timeout: 10000, // Increase timeout to 10 seconds
});

// Mock lab staff data for when backend is unavailable
const mockLabStaff = [
  {
    _id: "la1",
    name: "Sarah Johnson",
    staff_id: "LSF001",
    specialization: "Hematology",
    status: "Active"
  },
  {
    _id: "la2",
    name: "Michael Chen", 
    staff_id: "LSF002",
    specialization: "Chemistry",
    status: "Active"
  },
  {
    _id: "la3",
    name: "Emma Wilson",
    staff_id: "LSF003", 
    specialization: "Microbiology",
    status: "Active"
  },
  {
    _id: "la4",
    name: "David Brown",
    staff_id: "LSF004",
    specialization: "Immunology", 
    status: "Active"
  },
  {
    _id: "la5",
    name: "Lisa Anderson",
    staff_id: "LSF005",
    specialization: "General Lab",
    status: "Active"
  }
];

// Mock lab tasks data for when backend is unavailable
const mockTasks = [
  {
    _id: "1",
    task_id: "TSK001",
    taskTitle: "Equipment Calibration - Centrifuge",
    taskDescription: "Perform daily calibration of laboratory centrifuge equipment to ensure accurate test results",
    status: "Pending",
    priority: "High",
    labAssistant: {
      _id: "la1",
      name: "Sarah Johnson",
      staff_id: "LSF001"
    },
    dueDate: new Date(Date.now() + 86400000), // Tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "2", 
    task_id: "TSK002",
    taskTitle: "Quality Control - Blood Analysis",
    taskDescription: "Run quality control tests for blood analysis equipment and document results",
    status: "In Progress",
    priority: "Medium",
    labAssistant: {
      _id: "la2",
      name: "Michael Chen",
      staff_id: "LSF002"
    },
    dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString()
  },
  {
    _id: "3",
    task_id: "TSK003", 
    taskTitle: "Sample Storage Organization",
    taskDescription: "Organize and label sample storage areas according to new protocol guidelines",
    status: "Completed",
    priority: "Low",
    labAssistant: {
      _id: "la3",
      name: "Emily Davis",
      staff_id: "LSF003"
    },
    dueDate: new Date(Date.now() - 43200000), // 12 hours ago
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    _id: "4",
    task_id: "TSK004",
    taskTitle: "Chemical Inventory Audit",
    taskDescription: "Conduct monthly audit of chemical inventory and update tracking system",
    status: "Pending",
    priority: "Medium",
    labAssistant: {
      _id: "la4",
      name: "James Wilson", 
      staff_id: "LSF004"
    },
    dueDate: new Date(Date.now() + 259200000), // 3 days from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "5",
    task_id: "TSK005",
    taskTitle: "Microscope Maintenance",
    taskDescription: "Perform weekly maintenance and cleaning of laboratory microscopes",
    status: "In Progress", 
    priority: "High",
    labAssistant: {
      _id: "la5",
      name: "Lisa Anderson",
      staff_id: "LSF005"
    },
    dueDate: new Date(Date.now() + 43200000), // 12 hours from now
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date().toISOString()
  }
];

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced API object with mock fallback
const TaskAPI = {
  // Get all tasks
  get: async (endpoint = "/") => {
    try {
      console.log("Attempting API call to:", `http://localhost:5000/api/labtasks${endpoint}`);
      const response = await API.get(endpoint);
      console.log("API call successful:", response.data);
      return response;
    } catch (error) {
      console.error("Backend API call failed:", error.message);
      console.error("Full error details:", error);
      
      // Only use mock data if it's a connection error, not validation errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
        console.warn("Backend unavailable, using mock data:", error.message);
        
        // Simulate API delay
        await delay(500);
        
        // Handle different endpoints
        if (endpoint === "/lab-staff") {
          console.log("Returning mock lab staff data");
          return {
            data: mockLabStaff
          };
        }
        
        // Return mock data in the expected format for tasks
        console.log("Returning mock task data");
        return {
          data: {
            success: true,
            message: "Mock tasks retrieved successfully",
            tasks: mockTasks
          }
        };
      } else {
        // For other errors (like 400, 404, 500), throw the error instead of using mock data
        throw error;
      }
    }
  },

  // Create new task
  post: async (endpoint, data) => {
    try {
      console.log("Attempting POST request to:", `http://localhost:5000/api/labtasks${endpoint}`, "with data:", data);
      const response = await API.post(endpoint, data);
      console.log("POST request successful:", response.data);
      return response;
    } catch (error) {
      console.error("POST request failed:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error:", error);
      
      // Only use mock data if it's a connection error, not validation errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
        console.warn("Backend unavailable for task creation, using mock data:", error.message);
        
        // Simulate task creation
        const newTask = {
          _id: String(mockTasks.length + 1),
          task_id: `TSK${String(mockTasks.length + 1).padStart(3, '0')}`,
          ...data,
          status: data.status || "Pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        mockTasks.push(newTask);
        await delay(400);
        
        return {
          data: {
            success: true,
            message: "Mock task created successfully",
            task: newTask
          }
        };
      } else {
        // For other errors (like 400, 404, 500), throw the error instead of using mock data
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
        throw new Error(`Failed to create task: ${errorMessage}`);
      }
    }
  },

  // Update task
  put: async (endpoint, data) => {
    try {
      console.log("Attempting PUT request to:", `http://localhost:5000/api/labtasks${endpoint}`, "with data:", data);
      const response = await API.put(endpoint, data);
      console.log("PUT request successful:", response.data);
      return response;
    } catch (error) {
      console.error("PUT request failed:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error:", error);
      
      // Throw the actual error with more details
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(`Failed to update task: ${errorMessage}`);
    }
  },

  // Delete task
  delete: async (endpoint) => {
    try {
      const response = await API.delete(endpoint);
      return response;
    } catch (error) {
      console.warn("Backend unavailable for task deletion, simulating:", error.message);
      
      // Extract task ID from endpoint
      const taskId = endpoint.replace('/', '');
      const taskIndex = mockTasks.findIndex(task => task._id === taskId);
      
      if (taskIndex !== -1) {
        mockTasks.splice(taskIndex, 1);
        await delay(300);
        
        return {
          data: {
            success: true,
            message: "Mock task deleted successfully"
          }
        };
      } else {
        throw new Error("Task not found in mock data");
      }
    }
  }
};

export default TaskAPI;
