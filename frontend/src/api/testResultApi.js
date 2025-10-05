import api from './api';

class TestResultAPI {
  // Base URL for test result endpoints
  static baseURL = '/test-results';

  // Get test result by test ID
  static async getTestResult(testId) {
    try {
      const response = await api.get(`${this.baseURL}/test/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test result:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch test result');
    }
  }

  // Get test result by lab test ID
  static async getTestResultByLabTestId(labTestId) {
    try {
      const response = await api.get(`${this.baseURL}/lab-test/${labTestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test result by lab test ID:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch test result');
    }
  }

  // Get all test results with pagination and filtering
  static async getAllTestResults(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        testType,
        patientId,
        startDate,
        endDate
      } = params;

      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (status) queryParams.append('status', status);
      if (testType) queryParams.append('testType', testType);
      if (patientId) queryParams.append('patientId', patientId);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await api.get(`${this.baseURL}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch test results');
    }
  }

  // Create or update test result
  static async createOrUpdateTestResult(testId, testResultData) {
    try {
      const response = await api.post(`${this.baseURL}/test/${testId}`, testResultData);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating test result:', error);
      throw new Error(error.response?.data?.message || 'Failed to create/update test result');
    }
  }

  // Upload test result with files
  static async uploadTestResultWithFiles(testId, formData) {
    try {
      const response = await api.post(`${this.baseURL}/test/${testId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading test result with files:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload test result');
    }
  }

  // Update test result
  static async updateTestResult(testId, testResultData) {
    try {
      const response = await api.put(`${this.baseURL}/test/${testId}`, testResultData);
      return response.data;
    } catch (error) {
      console.error('Error updating test result:', error);
      throw new Error(error.response?.data?.message || 'Failed to update test result');
    }
  }

  // Delete test result
  static async deleteTestResult(testId) {
    try {
      const response = await api.delete(`${this.baseURL}/test/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting test result:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete test result');
    }
  }

  // Get test result summary
  static async getTestResultSummary() {
    try {
      const response = await api.get(`${this.baseURL}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error getting test result summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to get test result summary');
    }
  }

  // Add attachment to test result
  static async addAttachment(testId, attachmentData) {
    try {
      const response = await api.post(`${this.baseURL}/test/${testId}/attachments`, attachmentData);
      return response.data;
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw new Error(error.response?.data?.message || 'Failed to add attachment');
    }
  }

  // Delete attachment from test result
  static async deleteAttachment(testId, attachmentId) {
    try {
      const response = await api.delete(`${this.baseURL}/test/${testId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete attachment');
    }
  }

  // Create sample test results for demo
  static async createSampleTestResults() {
    try {
      const response = await api.post(`${this.baseURL}/sample-data`);
      return response.data;
    } catch (error) {
      console.error('Error creating sample test results:', error);
      throw new Error(error.response?.data?.message || 'Failed to create sample test results');
    }
  }

  // Download test result as PDF
  static async downloadResultPDF(testId) {
    try {
      const response = await api.get(`${this.baseURL}/test/${testId}/pdf`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error(error.response?.data?.message || 'Failed to download PDF');
    }
  }

  // Share test result
  static async shareTestResult(testId, shareData) {
    try {
      const response = await api.post(`${this.baseURL}/test/${testId}/share`, shareData);
      return response.data;
    } catch (error) {
      console.error('Error sharing test result:', error);
      throw new Error(error.response?.data?.message || 'Failed to share test result');
    }
  }

  // Send notification
  static async sendNotification(testId, notificationData) {
    try {
      const response = await api.post(`${this.baseURL}/test/${testId}/notification`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
  }

  // Mock test result data for offline development
  static getMockTestResult(testId) {
    return {
      success: true,
      data: {
        testId: testId || 'LT-10003',
        labTestId: null,
        testType: 'Urinalysis',
        status: 'Verified',
        completedDate: '2023-05-24T00:00:00.000Z',
        requestedDate: '2023-05-24T00:00:00.000Z',
        patient: {
          name: 'Robert Brown',
          patientId: 'PT-12347',
          dateOfBirth: '1975-01-15T00:00:00.000Z',
          gender: 'Male'
        },
        requestedBy: 'Dr. James Wilson',
        parameters: [
          {
            parameter: 'Color',
            result: 'Yellow',
            referenceRange: 'Yellow to Amber',
            status: 'Normal',
            unit: ''
          },
          {
            parameter: 'Appearance',
            result: 'Clear',
            referenceRange: 'Clear',
            status: 'Normal',
            unit: ''
          },
          {
            parameter: 'pH',
            result: '6.0',
            referenceRange: '4.5-8.0',
            status: 'Normal',
            unit: ''
          },
          {
            parameter: 'Specific Gravity',
            result: '1.025',
            referenceRange: '1.005-1.030',
            status: 'Normal',
            unit: ''
          },
          {
            parameter: 'Glucose',
            result: 'Negative',
            referenceRange: 'Negative',
            status: 'Normal',
            unit: ''
          },
          {
            parameter: 'Protein',
            result: 'Trace',
            referenceRange: 'Negative',
            status: 'Abnormal',
            unit: ''
          },
          {
            parameter: 'Ketones',
            result: 'Negative',
            referenceRange: 'Negative',
            status: 'Normal',
            unit: ''
          }
        ],
        labNotes: 'Patient sample was collected at 9:15 AM and processed within 30 minutes of collection. Trace amounts of protein detected which may indicate mild dehydration or possible early signs of kidney issues. Recommend follow-up testing in 2 weeks if protein remains present.',
        performedBy: {
          name: 'Lisa Adams',
          role: 'Lab Assistant'
        },
        verifiedBy: {
          name: 'Kevin Lee',
          role: 'Lab Supervisor'
        },
        attachments: [
          {
            _id: 'att1',
            fileName: 'Urinalysis_Report_LT10003.pdf',
            fileType: 'PDF',
            fileSize: '1.2 MB',
            filePath: '/attachments/urinalysis/LT10003_report.pdf',
            uploadDate: '2023-05-24T00:00:00.000Z'
          },
          {
            _id: 'att2',
            fileName: 'Lab_Images_LT10003.jpg',
            fileType: 'JPG',
            fileSize: '3.5 MB',
            filePath: '/attachments/urinalysis/LT10003_images.jpg',
            uploadDate: '2023-05-24T00:00:00.000Z'
          }
        ],
        createdAt: '2023-05-24T00:00:00.000Z',
        updatedAt: '2023-05-24T00:00:00.000Z'
      }
    };
  }
}

export default TestResultAPI;