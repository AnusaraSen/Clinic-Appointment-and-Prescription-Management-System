/**
 * Jest Configuration for Backend Testing
 * Clinic Appointment and Prescription Management System
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Paths to collect coverage from
  collectCoverageFrom: [
    'modules/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**'
  ],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage thresholds
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
