/**
 * User Reports Controller Tests
 * Tests for user analytics and reporting endpoints
 */

const UserReportsController = require('../../modules/workforce-facility/controllers/UserReportsController');

// Mock the User model
jest.mock('../../modules/workforce-facility/models/User');
const User = require('../../modules/workforce-facility/models/User');

describe('UserReportsController', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      query: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getReportMetrics', () => {
    test('should return user metrics successfully', async () => {
      // Mock database responses
      User.countDocuments = jest.fn()
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(75)  // activeUsers
        .mockResolvedValueOnce(10)  // newUsersThisMonth
        .mockResolvedValueOnce(5);  // lockedAccounts

      User.aggregate = jest.fn().mockResolvedValue([
        { _id: 'Doctor', count: 30 }
      ]);

      await UserReportsController.getReportMetrics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalUsers: 100,
          activeUsers: 75,
          newUsersThisMonth: 10,
          lockedAccounts: 5,
          activityRate: 75
        })
      });
    });

    test('should handle errors gracefully', async () => {
      User.countDocuments = jest.fn().mockRejectedValue(new Error('Database error'));

      await UserReportsController.getReportMetrics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch user metrics',
        error: 'Database error'
      });
    });

    test('should apply role filter when provided', async () => {
      req.query.role = 'Doctor';

      User.countDocuments = jest.fn().mockResolvedValue(30);
      User.aggregate = jest.fn().mockResolvedValue([]);

      await UserReportsController.getReportMetrics(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'Doctor' })
      );
    });
  });

  describe('getRegistrationTrend', () => {
    test('should return registration trend data', async () => {
      const mockTrendData = [
        { _id: { year: 2025, month: 9 }, count: 15 },
        { _id: { year: 2025, month: 10 }, count: 10 }
      ];

      User.aggregate = jest.fn().mockResolvedValue(mockTrendData);

      await UserReportsController.getRegistrationTrend(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ month: 'Sep', year: 2025, count: 15 }),
          expect.objectContaining({ month: 'Oct', year: 2025, count: 10 })
        ])
      });
    });
  });

  describe('getActivityData', () => {
    test('should return user activity data', async () => {
      const mockUsers = [
        {
          user_id: 'USR-0001',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Doctor',
          lastLogin: new Date('2025-10-18'),
          loginAttempts: 0
        }
      ];

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers)
          })
        })
      });

      await UserReportsController.getActivityData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: 'USR-0001',
            name: 'John Doe',
            role: 'Doctor'
          })
        ])
      });
    });
  });

  describe('exportUserData', () => {
    test('should export user data successfully', async () => {
      const mockUser = {
        user_id: 'USR-0001',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Doctor',
        phone: '1234567890',
        age: 35,
        gender: 'Male',
        address: '123 Main St',
        isActive: true,
        isLocked: false,
        createdAt: new Date('2025-01-01'),
        lastLogin: new Date('2025-10-18'),
        loginAttempts: 0
      };

      req.params.userId = 'USR-0001';
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await UserReportsController.exportUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          userId: 'USR-0001',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Doctor'
        })
      });
    });

    test('should return 404 when user not found', async () => {
      req.params.userId = 'USR-9999';
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await UserReportsController.exportUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
});
