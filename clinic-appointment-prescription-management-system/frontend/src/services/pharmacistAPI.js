// API Service for Pharmacist functionality
const API_BASE_URL = 'http://localhost:5000/api';

class PharmacistAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('pharmacistToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication Methods
  async login(credentials) {
    const response = await fetch(`${this.baseURL}/pharmacist/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  async register(pharmacistData) {
    const response = await fetch(`${this.baseURL}/pharmacist/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pharmacistData)
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/pharmacist/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Dashboard Methods
  async getDashboard() {
    const response = await fetch(`${this.baseURL}/pharmacist/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Profile Methods
  async getProfile() {
    const response = await fetch(`${this.baseURL}/pharmacist/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/pharmacist/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return this.handleResponse(response);
  }

  // Prescription Methods
  async getPrescriptions(filters = {}) {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'All') {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(
      `${this.baseURL}/pharmacist/prescriptions?${params.toString()}`,
      {
        headers: this.getAuthHeaders()
      }
    );
    return this.handleResponse(response);
  }

  async getPrescriptionDetails(prescriptionId) {
    const response = await fetch(
      `${this.baseURL}/pharmacist/prescriptions/${prescriptionId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
    return this.handleResponse(response);
  }

  async updatePrescriptionStatus(prescriptionId, statusData) {
    const response = await fetch(
      `${this.baseURL}/pharmacist/prescriptions/${prescriptionId}/status`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(statusData)
      }
    );
    return this.handleResponse(response);
  }

  async dispenseMedication(prescriptionId, dispensingData) {
    const response = await fetch(
      `${this.baseURL}/pharmacist/prescriptions/${prescriptionId}/dispense`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dispensingData)
      }
    );
    return this.handleResponse(response);
  }

  // Statistics Methods
  async getPrescriptionStats() {
    const response = await fetch(`${this.baseURL}/prescriptions/stats`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Utility Methods
  isAuthenticated() {
    return !!localStorage.getItem('pharmacistToken');
  }

  getPharmacistInfo() {
    try {
      const info = localStorage.getItem('pharmacistInfo');
      return info ? JSON.parse(info) : null;
    } catch (error) {
      console.error('Error parsing pharmacist info:', error);
      return null;
    }
  }

  clearAuth() {
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistInfo');
  }

  setAuth(token, pharmacistInfo) {
    localStorage.setItem('pharmacistToken', token);
    localStorage.setItem('pharmacistInfo', JSON.stringify(pharmacistInfo));
  }
}

// Create singleton instance
const pharmacistAPI = new PharmacistAPI();

export default pharmacistAPI;

// Export specific methods for easier imports
export const {
  login,
  register,
  logout,
  getDashboard,
  getProfile,
  updateProfile,
  getPrescriptions,
  getPrescriptionDetails,
  updatePrescriptionStatus,
  dispenseMedication,
  getPrescriptionStats,
  isAuthenticated,
  getPharmacistInfo,
  clearAuth,
  setAuth
} = pharmacistAPI;