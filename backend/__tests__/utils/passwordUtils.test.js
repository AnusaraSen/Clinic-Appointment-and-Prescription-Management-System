/**
 * Password Utils Tests
 * Tests for password hashing and comparison utilities
 */

const { hashPassword, comparePassword } = require('../../utils/passwordUtils');

describe('Password Utilities', () => {
  const testPassword = 'TestPassword123!@#';

  describe('hashPassword', () => {
    test('should hash a password', async () => {
      const hash = await hashPassword(testPassword);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(20);
    });

    test('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });

    test('should handle empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow();
    });
  });

  describe('comparePassword', () => {
    let hashedPassword;

    beforeAll(async () => {
      hashedPassword = await hashPassword(testPassword);
    });

    test('should return true for correct password', async () => {
      const result = await comparePassword(testPassword, hashedPassword);
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const result = await comparePassword('WrongPassword123', hashedPassword);
      expect(result).toBe(false);
    });

    test('should be case sensitive', async () => {
      const result = await comparePassword(testPassword.toLowerCase(), hashedPassword);
      expect(result).toBe(false);
    });

    test('should handle empty password comparison', async () => {
      const result = await comparePassword('', hashedPassword);
      expect(result).toBe(false);
    });
  });
});
