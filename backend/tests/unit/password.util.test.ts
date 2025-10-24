/**
 * Unit Tests: Password Utils
 * Testet Password Hashing und Vergleich
 */

import { hashPassword, comparePasswords } from '../../src/utils/password';

describe('Password Utils - Unit Tests', () => {
  describe('hashPassword()', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should create different hashes for same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Bcrypt verwendet Salt
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
    });
  });

  describe('comparePasswords()', () => {
    it('should return true for matching password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePasswords(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePasswords('WrongPassword123!', hash);
      expect(isMatch).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'Password123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePasswords('password123!', hash);
      expect(isMatch).toBe(false);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);

      const isMatch = await comparePasswords(password, hash);
      expect(isMatch).toBe(true);
    });
  });
});
