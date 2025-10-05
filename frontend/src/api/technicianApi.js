/**
 * Technician API Service - Handle technician-specific API operations
 * Provides centralized API functions for technician dashboard functionality
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Helper function to handle API requests with error handling
 */
const makeRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('accessToken');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

/**
 * Get technician dashboard statistics
 */
export const getTechnicianDashboard = async (technicianId) => {
  try {
    // Try the dedicated technician dashboard endpoint first
    const response = await makeRequest(`/api/technicians/${technicianId}/dashboard-stats`);
    return response;
  } catch (error) {
    // Fallback: build stats from individual endpoints
    console.warn('Dedicated dashboard endpoint failed, using fallback');
    
    const [tasksRes, scheduleRes] = await Promise.allSettled([
      makeRequest(`/api/technicians/${technicianId}/tasks`),
      makeRequest(`/api/technicians/${technicianId}/schedule`)
    ]);

    const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data || [] : [];
    const schedule = scheduleRes.status === 'fulfilled' ? scheduleRes.value.data || [] : [];

    // Build basic stats from available data
    const today = new Date();
    const todayString = today.toDateString();

    const stats = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => ['Scheduled', 'Assigned'].includes(t.status)).length,
      inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      todaysTasks: tasks.filter(t => {
        const taskDate = new Date(t.scheduled_date);
        return taskDate.toDateString() === todayString;
      }).length,
      overdueTasks: tasks.filter(t => {
        const taskDate = new Date(t.scheduled_date);
        return taskDate < today && !['Completed', 'Cancelled'].includes(t.status);
      }).length
    };

    return { success: true, data: stats };
  }
};

/**
 * Get technician's assigned tasks
 */
export const getTechnicianTasks = async (technicianId, filters = {}) => {
  try {
    // Try dedicated technician tasks endpoint
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/api/technicians/${technicianId}/tasks${queryParams ? `?${queryParams}` : ''}`;
    return await makeRequest(url);
  } catch (error) {
    // Fallback: get from scheduled maintenance
    console.warn('Dedicated tasks endpoint failed, using scheduled maintenance fallback');
    const fallbackUrl = `/api/scheduled-maintenance?technician=${technicianId}`;
    return await makeRequest(fallbackUrl);
  }
};

/**
 * Get technician's schedule
 */
export const getTechnicianSchedule = async (technicianId, dateRange = {}) => {
  try {
    const queryParams = new URLSearchParams(dateRange).toString();
    const url = `/api/technicians/${technicianId}/schedule${queryParams ? `?${queryParams}` : ''}`;
    return await makeRequest(url);
  } catch (error) {
    // Fallback: get from scheduled maintenance with date filters
    console.warn('Dedicated schedule endpoint failed, using fallback');
    const fallbackParams = { technician: technicianId, ...dateRange };
    const fallbackUrl = `/api/scheduled-maintenance?${new URLSearchParams(fallbackParams).toString()}`;
    return await makeRequest(fallbackUrl);
  }
};

/**
 * Update task status
 */
export const updateTaskStatus = async (taskId, statusData) => {
  const url = `/api/scheduled-maintenance/${taskId}`;
  return await makeRequest(url, {
    method: 'PATCH',
    body: JSON.stringify({
      status: statusData.status,
      technician_notes: statusData.notes,
      updated_at: new Date().toISOString(),
      status_updated_by: 'technician',
      ...(statusData.additionalData || {})
    })
  });
};

/**
 * Update technician availability
 */
export const updateTechnicianAvailability = async (technicianId, availabilityData) => {
  const url = `/api/technicians/${technicianId}/availability`;
  return await makeRequest(url, {
    method: 'PUT',
    body: JSON.stringify(availabilityData)
  });
};

/**
 * Get technician profile information
 */
export const getTechnicianProfile = async (technicianId) => {
  const url = `/api/technicians/${technicianId}`;
  return await makeRequest(url);
};

/**
 * Update technician profile
 */
export const updateTechnicianProfile = async (technicianId, profileData) => {
  const url = `/api/technicians/${technicianId}`;
  return await makeRequest(url, {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  });
};

/**
 * Add notes to a task
 */
export const addTaskNotes = async (taskId, notes) => {
  const url = `/api/scheduled-maintenance/${taskId}/notes`;
  return await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      notes,
      added_by: 'technician',
      timestamp: new Date().toISOString()
    })
  });
};

/**
 * Get task history/audit trail
 */
export const getTaskHistory = async (taskId) => {
  const url = `/api/scheduled-maintenance/${taskId}/history`;
  return await makeRequest(url);
};

/**
 * Refresh dashboard cache (if implemented on backend)
 */
export const refreshTechnicianDashboard = async (technicianId) => {
  try {
    const url = `/api/technicians/${technicianId}/dashboard/refresh`;
    return await makeRequest(url, { method: 'POST' });
  } catch (error) {
    // If refresh endpoint doesn't exist, just re-fetch the data
    console.warn('Refresh endpoint not available, re-fetching data');
    return await getTechnicianDashboard(technicianId);
  }
};

export default {
  getTechnicianDashboard,
  getTechnicianTasks,
  getTechnicianSchedule,
  updateTaskStatus,
  updateTechnicianAvailability,
  getTechnicianProfile,
  updateTechnicianProfile,
  addTaskNotes,
  getTaskHistory,
  refreshTechnicianDashboard
};