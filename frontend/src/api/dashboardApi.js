import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock dashboard data for when backend is unavailable
const mockDashboardData = {
  statistics: {
    pendingTests: 12,
    inProgressTests: 8,
    completedToday: 25,
    urgentTests: 3
  },
  recentTestAssignments: [
    {
      _id: "1",
      patientName: "John Doe",
      patientId: "P001",
      testType: "Complete Blood Count",
      priority: "High",
      assignedTo: "Lisa Adams",
      status: "In Progress"
    },
    {
      _id: "2",
      patientName: "Jane Smith",
      patientId: "P002",
      testType: "Lipid Profile",
      priority: "Medium",
      assignedTo: "Mark Wilson",
      status: "Pending"
    },
    {
      _id: "3",
      patientName: "Mike Johnson",
      patientId: "P003",
      testType: "Urine Analysis",
      priority: "High",
      assignedTo: "Jane Davis",
      status: "Completed"
    },
    {
      _id: "4",
      patientName: "Emily Davis",
      patientId: "P004",
      testType: "Blood Glucose",
      priority: "Low",
      assignedTo: "Lisa Adams",
      status: "Pending"
    },
    {
      _id: "5",
      patientName: "Robert Brown",
      patientId: "P005",
      testType: "Liver Function Test",
      priority: "High",
      assignedTo: "Mark Wilson",
      status: "In Progress"
    }
  ],
  labStaffAvailability: [
    {
      _id: "s1",
      staff_id: "LS",
      name: "Lisa Adams",
      role: "Lab Assistant",
      status: "Available"
    },
    {
      _id: "s2",
      staff_id: "MW",
      name: "Mark Wilson",
      role: "Lab Assistant",
      status: "Busy"
    },
    {
      _id: "s3",
      staff_id: "JD",
      name: "Jane Davis",
      role: "Lab Assistant",
      status: "Available"
    },
    {
      _id: "s4",
      staff_id: "KL",
      name: "Kevin Lee",
      role: "Lab Technician",
      status: "Available"
    },
    {
      _id: "s5",
      staff_id: "RM",
      name: "Rachel Miller",
      role: "Lab Technician",
      status: "Off Duty"
    }
  ]
};

const mockTaskStatistics = {
  totalTasks: 45,
  completedTasks: 32,
  pendingTasks: 8,
  inProgressTasks: 5,
  overdueTasks: 2
};

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Dashboard API calls
export const dashboardApi = {
  // Get dashboard data (statistics, recent assignments, staff availability)
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable for dashboard, using mock data:', error.message);
      
      // Simulate API delay
      await delay(500);
      
      return {
        success: true,
        message: "Mock dashboard data retrieved successfully",
        data: mockDashboardData
      };
    }
  },

  // Get task statistics
  getTaskStatistics: async () => {
    try {
      const response = await api.get('/dashboard/tasks');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable for task statistics, using mock data:', error.message);
      
      // Simulate API delay
      await delay(300);
      
      return {
        success: true,
        message: "Mock task statistics retrieved successfully",
        data: mockTaskStatistics
      };
    }
  }
};

export default api;