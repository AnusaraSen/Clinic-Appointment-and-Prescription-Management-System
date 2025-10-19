/**
 * User Model Tests
 * Tests for the User model validation and methods
 */

const User = require('../../modules/workforce-facility/models/User');
const { hashPassword } = require('../../utils/passwordUtils');

describe('User Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid user', () => {
      const userData = {
        user_id: 'USR-1234',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Doctor',
        password: 'SecurePassword123'
      };

      const user = new User(userData);
      const validationError = user.validateSync();
      
      expect(validationError).toBeUndefined();
      expect(user.user_id).toBe('USR-1234');
      expect(user.email).toBe('john@example.com');
    });

    test('should fail without required fields', () => {
      const user = new User({});
      const validationError = user.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.user_id).toBeDefined();
      expect(validationError.errors.name).toBeDefined();
      expect(validationError.errors.email).toBeDefined();
      expect(validationError.errors.role).toBeDefined();
    });

    test('should validate email format', () => {
      const user = new User({
        user_id: 'USR-1234',
        name: 'John Doe',
        email: 'invalid-email',
        role: 'Doctor',
        password: 'password123'
      });

      const validationError = user.validateSync();
      expect(validationError.errors.email).toBeDefined();
    });

    test('should validate user_id format', () => {
      const user = new User({
        user_id: 'INVALID',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Doctor',
        password: 'password123'
      });

      const validationError = user.validateSync();
      expect(validationError.errors.user_id).toBeDefined();
    });

    test('should validate role enum', () => {
      const user = new User({
        user_id: 'USR-1234',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'InvalidRole',
        password: 'password123'
      });

      const validationError = user.validateSync();
      expect(validationError.errors.role).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });
  });

  describe('Virtual Properties', () => {
    test('should have isLocked virtual property', () => {
      const user = new User({
        user_id: 'USR-1234',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Doctor',
        lockUntil: new Date(Date.now() + 1000000) // Future date
      });

      expect(user.isLocked).toBe(true);
    });

    test('isLocked should be false when lockUntil is in past', () => {
      const user = new User({
        user_id: 'USR-1234',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Doctor',
        lockUntil: new Date(Date.now() - 1000000) // Past date
      });

      expect(user.isLocked).toBe(false);
    });
  });
});
