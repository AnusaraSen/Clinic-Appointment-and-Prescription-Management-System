import axios from 'axios';

/**
 * Reports API Service
 * Handles all API calls for maintenance reports and analytics
 */

// Create axios instance with correct base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Temporary flag - set to true to use mock data, false to use real API
const USE_MOCK_DATA = false;

// Mock data for testing
const mockMetrics = {
  totalRequests: 245,
  completionRate: 87,
  avgCompletionTime: 16,
  activeTechnicians: 12,
  totalCost: 8450,
  requestsTrend: { value: "+12%", isPositive: true },
  completionTrend: { value: "+8%", isPositive: true },
  timeTrend: { value: "-2 hrs", isPositive: true },
  techniciansTrend: { value: "+2", isPositive: true },
  costTrend: { value: "+$450", isPositive: false }
};

/**
 * Get report metrics (KPIs)
 */
export const getReportMetrics = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockMetrics });
      }, 500);
    });
  }

  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);

    const response = await api.get(`/maintenance-requests/reports/metrics?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report metrics:', error);
    throw error;
  }
};

const mockStatusDistribution = [
  { status: "Open", count: 37, percentage: 15 },
  { status: "In Progress", count: 49, percentage: 20 },
  { status: "Completed", count: 147, percentage: 60 },
  { status: "Cancelled", count: 12, percentage: 5 }
];

/**
 * Get status distribution data
 */
export const getStatusDistribution = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockStatusDistribution });
      }, 500);
    });
  }

  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/maintenance-requests/reports/status-distribution?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    throw error;
  }
};

const mockTechnicianWorkload = [
  { technician_id: "T001", name: "John Smith", requestCount: 24, availability: "busy" },
  { technician_id: "T002", name: "Maria Garcia", requestCount: 18, availability: "available" },
  { technician_id: "T003", name: "David Lee", requestCount: 15, availability: "available" },
  { technician_id: "T004", name: "Sarah Johnson", requestCount: 12, availability: "available" },
  { technician_id: "T005", name: "Michael Brown", requestCount: 8, availability: "available" }
];

/**
 * Get technician workload data
 */
export const getTechnicianWorkload = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockTechnicianWorkload });
      }, 500);
    });
  }

  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/technicians/reports/workload?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching technician workload:', error);
    throw error;
  }
};

const mockRequestsTrend = [
  { month: "Jan", created: 28, completed: 24 },
  { month: "Feb", created: 35, completed: 32 },
  { month: "Mar", created: 42, completed: 40 },
  { month: "Apr", created: 38, completed: 36 },
  { month: "May", created: 45, completed: 42 },
  { month: "Jun", created: 52, completed: 48 },
  { month: "Jul", created: 58, completed: 55 },
  { month: "Aug", created: 62, completed: 60 },
  { month: "Sep", created: 55, completed: 52 },
  { month: "Oct", created: 48, completed: 44 }
];

/**
 * Get requests trend data (monthly created vs completed)
 */
export const getRequestsTrend = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockRequestsTrend });
      }, 500);
    });
  }

  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupBy) params.append('groupBy', filters.groupBy); // 'month' or 'week'

    const response = await api.get(`/maintenance-requests/reports/trend?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching requests trend:', error);
    throw error;
  }
};

const mockDetailedRequests = [
  {
    _id: "1",
    request_id: "MR-1001",
    title: "AC not cooling in Room 301",
    status: "In Progress",
    priority: "High",
    assignedTo: { firstName: "Maria", lastName: "Garcia" },
    reportedBy: { name: "John Doe" },
    equipment: [{ name: "HVAC Unit A" }],
    date: "2025-10-05",
    cost: 250
  },
  {
    _id: "2",
    request_id: "MR-1002",
    title: "Broken door handle in Lobby",
    status: "Completed",
    priority: "Low",
    assignedTo: { firstName: "David", lastName: "Lee" },
    reportedBy: { name: "Jane Smith" },
    equipment: [{ name: "Main Door" }],
    date: "2025-10-03",
    cost: 50
  },
  {
    _id: "3",
    request_id: "MR-1003",
    title: "Electrical issue in Lab 2",
    status: "Open",
    priority: "Critical",
    assignedTo: null,
    reportedBy: { name: "Mike Johnson" },
    equipment: [{ name: "Electrical Panel B" }],
    date: "2025-10-07",
    cost: 0
  },
  {
    _id: "4",
    request_id: "MR-1004",
    title: "Water leak in Bathroom 2F",
    status: "In Progress",
    priority: "High",
    assignedTo: { firstName: "John", lastName: "Smith" },
    reportedBy: { name: "Sarah Williams" },
    equipment: [{ name: "Plumbing System" }],
    date: "2025-10-06",
    cost: 150
  },
  {
    _id: "5",
    request_id: "MR-1005",
    title: "Replace air filters",
    status: "Completed",
    priority: "Medium",
    assignedTo: { firstName: "Maria", lastName: "Garcia" },
    reportedBy: { name: "Admin" },
    equipment: [{ name: "HVAC Unit B" }, { name: "HVAC Unit C" }],
    date: "2025-10-02",
    cost: 75
  },
  {
    _id: "6",
    request_id: "MR-1006",
    title: "Ceiling fan not working",
    status: "Open",
    priority: "Low",
    assignedTo: null,
    reportedBy: { name: "Robert Brown" },
    equipment: [{ name: "Ceiling Fan - Office 5" }],
    date: "2025-10-04",
    cost: 0
  },
  {
    _id: "7",
    request_id: "MR-1007",
    title: "Network equipment overheating",
    status: "In Progress",
    priority: "High",
    assignedTo: { firstName: "Sarah", lastName: "Johnson" },
    reportedBy: { name: "IT Department" },
    equipment: [{ name: "Server Room AC" }],
    date: "2025-10-05",
    cost: 300
  },
  {
    _id: "8",
    request_id: "MR-1008",
    title: "Paint touch-up needed",
    status: "Completed",
    priority: "Low",
    assignedTo: { firstName: "Michael", lastName: "Brown" },
    reportedBy: { name: "Facilities Manager" },
    equipment: [{ name: "Wall Paint" }],
    date: "2025-09-28",
    cost: 120
  }
];

/**
 * Get detailed maintenance requests data for table
 */
export const getDetailedRequests = async (filters = {}) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockDetailedRequests });
      }, 500);
    });
  }

  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.technicianId) params.append('technicianId', filters.technicianId);

    const response = await api.get(`/maintenance-requests?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed requests:', error);
    throw error;
  }
};

/**
 * Export report data
 */
export const exportReport = async (filters = {}, format = 'csv') => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    params.append('format', format);

    const response = await api.get(`/maintenance-requests/reports/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maintenance-report-${new Date().toISOString().slice(0, 10)}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

export default {
  getReportMetrics,
  getStatusDistribution,
  getTechnicianWorkload,
  getRequestsTrend,
  getDetailedRequests,
  exportReport
};
