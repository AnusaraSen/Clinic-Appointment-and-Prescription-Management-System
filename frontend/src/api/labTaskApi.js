import api from './api';

const base = '/api/labtasks';

const labTaskApi = {
  // Get all tasks (for supervisor)
  getAll: async () => {
    try {
      const response = await api.get(base);
      return response.data;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }
  },

  // Get my assigned tasks (for assistant)
  getMyTasks: async () => {
    try {
      const response = await api.get(`${base}/my`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw error;
    }
  },

  // Get task by ID
  getById: async (id) => {
    try {
      const response = await api.get(`${base}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw error;
    }
  },

  // Create new task
  create: async (taskData) => {
    try {
      const response = await api.post(base, taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  update: async (id, taskData) => {
    try {
      const response = await api.put(`${base}/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  delete: async (id) => {
    try {
      const response = await api.delete(`${base}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Assign task to assistant (supervisor only)
  assign: async (taskId, assistantId) => {
    try {
      const response = await api.post(`${base}/${taskId}/assign`, { 
        assistantId 
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  },

  // Update task status (assistant and supervisor)
  updateStatus: async (taskId, status) => {
    try {
      const response = await api.patch(`${base}/${taskId}/status`, { 
        status 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  // Start task (assistant)
  startTask: async (taskId) => {
    return labTaskApi.updateStatus(taskId, 'in_progress');
  },

  // Complete task (assistant)
  completeTask: async (taskId) => {
    return labTaskApi.updateStatus(taskId, 'completed');
  },

  // Get tasks by status
  getByStatus: async (status) => {
    try {
      const response = await api.get(`${base}?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw error;
    }
  },

  // Get unassigned tasks (supervisor)
  getUnassigned: async () => {
    try {
      const response = await api.get(`${base}/unassigned`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unassigned tasks:', error);
      throw error;
    }
  },

  // Get tasks assigned to specific assistant
  getTasksByAssistant: async (assistantId) => {
    try {
      const response = await api.get(`${base}/assistant/${assistantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by assistant:', error);
      throw error;
    }
  },

  // Update task priority (supervisor)
  updatePriority: async (taskId, priority) => {
    try {
      const response = await api.patch(`${base}/${taskId}/priority`, { 
        priority 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task priority:', error);
      throw error;
    }
  },

  // Add task notes/comments
  addNote: async (taskId, note) => {
    try {
      const response = await api.post(`${base}/${taskId}/notes`, { 
        note 
      });
      return response.data;
    } catch (error) {
      console.error('Error adding task note:', error);
      throw error;
    }
  },

  // Get task history/timeline
  getTaskHistory: async (taskId) => {
    try {
      const response = await api.get(`${base}/${taskId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task history:', error);
      throw error;
    }
  },

  // Get task statistics for dashboard
  getStatistics: async () => {
    try {
      const response = await api.get(`${base}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      throw error;
    }
  },

  // Bulk assign tasks (supervisor)
  bulkAssign: async (taskIds, assistantId) => {
    try {
      const response = await api.post(`${base}/bulk-assign`, { 
        taskIds, 
        assistantId 
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk assigning tasks:', error);
      throw error;
    }
  },

  // Search tasks
  search: async (query) => {
    try {
      const response = await api.get(`${base}/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }
};

export default labTaskApi;