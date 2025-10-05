/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * API client with automatic token handling
 */
class AuthAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/auth`;
  }

  /**
   * Get stored access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Remove tokens from localStorage
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Store user data
   */
  storeUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get stored user data
   */
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    return !!token; // Returns true if token exists, false otherwise
  }

  /**
   * Make API request with automatic token handling
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🔄 Making API request to:', url);
    
    const accessToken = this.getAccessToken();

    const config = {
      method: 'GET', // Default method
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (accessToken && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      console.log('📤 Request config:', config);
      const response = await fetch(url, config);
      console.log('📥 Response status:', response.status, response.statusText);
      
      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      console.log('📥 Response content-type:', contentType);
      
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If it's not JSON, get the text (likely HTML error page)
        const text = await response.text();
        console.log('📥 Response text (first 200 chars):', text.substring(0, 200));
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) {
        // If token expired, try to refresh
        if (response.status === 401 && endpoint !== '/refresh-token') {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            config.headers.Authorization = `Bearer ${this.getAccessToken()}`;
            const retryResponse = await fetch(url, config);
            return await retryResponse.json();
          }
        }

        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        this.storeTokens(accessToken, refreshToken);
        this.storeUser(user);
        return { success: true, user, data: response.data };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Register patient
   */
  async registerPatient(userData) {
    try {
      const response = await this.makeRequest('/register-patient', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        this.storeTokens(accessToken, refreshToken);
        this.storeUser(user);
        return { success: true, user, data: response.data };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Register staff (admin only)
   */
  async registerStaff(userData) {
    try {
      const response = await this.makeRequest('/register-staff', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response.success 
        ? { success: true, data: response.data }
        : { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.makeRequest('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed:', error.message);
    } finally {
      // Always clear local tokens
      this.clearTokens();
    }

    return { success: true };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await this.makeRequest('/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        this.storeTokens(accessToken, newRefreshToken);
        return true;
      }

      // Refresh failed, clear tokens
      this.clearTokens();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await this.makeRequest('/me');
      
      if (response.success) {
        this.storeUser(response.data);
        return { success: true, user: response.data };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if user is logged in (has valid token)
   */
  isLoggedIn() {
    return !!this.getAccessToken();
  }

  /**
   * Get current user role
   */
  getUserRole() {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole('Admin');
  }
}

// Export singleton instance
const authAPI = new AuthAPI();
export default authAPI;
