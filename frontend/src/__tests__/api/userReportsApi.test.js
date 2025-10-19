/**
 * User Reports API Tests
 * Tests for the user reports API service functions
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getUserReportMetrics,
  getRegistrationTrend,
  getUserActivity,
  getAllUsers,
  exportUserData
} from '../../../api/userReportsApi';

// Mock axios
vi.mock('axios');

describe('User Reports API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserReportMetrics', () => {
    test('should fetch user metrics successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            totalUsers: 100,
            activeUsers: 75,
            newUsersThisMonth: 10,
            lockedAccounts: 5,
            activityRate: 75
          }
        }
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await getUserReportMetrics({});
      
      expect(result).toEqual(mockResponse.data);
      expect(result.success).toBe(true);
      expect(result.data.totalUsers).toBe(100);
    });

    test('should handle filters in query params', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: { success: true, data: {} } });
      axios.create = vi.fn(() => ({ get: mockGet }));

      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-10-19',
        role: 'Doctor',
        status: 'active'
      };

      await getUserReportMetrics(filters);
      
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2025-01-01')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('role=Doctor')
      );
    });

    test('should handle API errors', async () => {
      axios.create = vi.fn(() => ({
        get: vi.fn().mockRejectedValue(new Error('Network error'))
      }));

      await expect(getUserReportMetrics({})).rejects.toThrow('Network error');
    });
  });

  describe('getRegistrationTrend', () => {
    test('should fetch registration trend data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { month: 'Sep', year: 2025, count: 15 },
            { month: 'Oct', year: 2025, count: 10 }
          ]
        }
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await getRegistrationTrend({});
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0].month).toBe('Sep');
      expect(result.data[0].count).toBe(15);
    });
  });

  describe('getUserActivity', () => {
    test('should fetch user activity data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              userId: 'USR-0001',
              name: 'John Doe',
              role: 'Doctor',
              lastLogin: '2025-10-18',
              daysSinceLogin: 1
            }
          ]
        }
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await getUserActivity({ limit: 10 });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe('USR-0001');
      expect(result.data[0].role).toBe('Doctor');
    });
  });

  describe('getAllUsers', () => {
    test('should fetch all users', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { user_id: 'USR-0001', name: 'John Doe', role: 'Doctor' },
            { user_id: 'USR-0002', name: 'Jane Smith', role: 'Nurse' }
          ]
        }
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await getAllUsers();
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0].user_id).toBe('USR-0001');
    });
  });

  describe('exportUserData', () => {
    test('should export individual user data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            userId: 'USR-0001',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Doctor',
            status: 'Active'
          }
        }
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await exportUserData('USR-0001');
      
      expect(result.data.userId).toBe('USR-0001');
      expect(result.data.name).toBe('John Doe');
      expect(result.data.role).toBe('Doctor');
    });

    test('should handle user not found', async () => {
      axios.create = vi.fn(() => ({
        get: vi.fn().mockRejectedValue(new Error('User not found'))
      }));

      await expect(exportUserData('USR-9999')).rejects.toThrow('User not found');
    });
  });
});
