/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_2024';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_2024';
process.env.ACCESS_TOKEN_DURATION = '1h';
process.env.REFRESH_TOKEN_DURATION = '7d';

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    user_id: 'USR-TEST',
    name: 'Test User',
    email: 'test@example.com',
    role: 'Admin',
    password: 'TestPassword123'
  },

  // Mock maintenance request
  mockMaintenanceRequest: {
    request_id: 'MR-TEST',
    title: 'Test Maintenance Request',
    description: 'Test description',
    status: 'Open',
    priority: 'Medium',
    category: 'maintenance',
    cost: 0
  },

  // Mock technician
  mockTechnician: {
    technician_id: 'T-TEST',
    name: 'Test Technician',
    phone: '1234567890',
    availability: true,
    isCurrentlyEmployed: true
  }
};

// Console spy to suppress logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error
};
