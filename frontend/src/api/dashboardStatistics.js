/**
 * Dashboard Statistics API Service - One API call to rule them all! 📊⚡
 * 
 * This service replaces multiple API calls with a single optimized endpoint
 * that provides all dashboard statistics in one go. Much faster! 🚀
 */

const API_BASE_URL = '/api'; // Use relative URL to leverage Vite proxy

/**
 * Fetch comprehensive dashboard statistics from the backend
 * This replaces the need for multiple API calls to different endpoints
 */
export const fetchDashboardStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch dashboard statistics');
    }

    console.log('📊 Dashboard statistics fetched successfully', {
      cached: result.cached,
      dataSize: JSON.stringify(result.data).length
    });

    return result.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard statistics:', error);
    throw error;
  }
};

/**
 * Force refresh the dashboard statistics cache
 * Useful when you know data has changed and want fresh results
 */
export const refreshDashboardCache = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/statistics/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to refresh cache');
    }

    console.log('🔄 Dashboard cache refreshed successfully');
    return result;
  } catch (error) {
    console.error('❌ Error refreshing dashboard cache:', error);
    throw error;
  }
};

/**
 * Check if the dashboard API is healthy
 */
export const checkDashboardHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/health`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Dashboard health check failed:', error);
    return { success: false, message: 'Dashboard API unreachable' };
  }
};