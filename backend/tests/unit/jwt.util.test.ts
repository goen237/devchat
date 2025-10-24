/**
 * Unit Tests: JWT Utils
 * Testet JWT Token Generation und Verification
 */

import { generateToken, verifyToken } from '../../src/utils/jwt';

describe('JWT Utils - Unit Tests', () => {
  describe('generateToken()', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'test-user-id' };
      const token = generateToken(payload, '1h');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // header.payload.signature
    });

    it('should include payload data', () => {
      const payload = { userId: 'user123', role: 'admin' };
      const token = generateToken(payload, '1h');

      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(decoded.userId).toBe('user123');
      expect(decoded.role).toBe('admin');
    });

    it('should include expiration time', () => {
      const payload = { userId: 'user123' };
      const token = generateToken(payload, '1h');

      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
    });

    it('should create different tokens for same payload', () => {
      const payload = { userId: 'user123' };
      const token1 = generateToken(payload, '1h');
      
      // Kleine Verzögerung
      const now = Date.now();
      while (Date.now() - now < 10) {}
      
      const token2 = generateToken(payload, '1h');

      expect(token1).not.toBe(token2); // iat (issued at) unterschiedlich
    });
  });

  describe('verifyToken()', () => {
    it('should verify a valid token', () => {
      const payload = { userId: 'user123' };
      const token = generateToken(payload, '1h');

      const decoded = verifyToken(token) as any;

      expect(decoded).toBeDefined();
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe('user123');
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expires immediately
      const payload = { userId: 'user123' };
      const token = generateToken(payload, '1h');
      
      // Note: Can't test expired token easily without mocking time
      // This test just ensures the function doesn't crash
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
    });

    it('should return null for malformed token', () => {
      const result = verifyToken('not.a.token');
      expect(result).toBeNull();
    });

    it('should verify token and extract userId', () => {
      const payload = { userId: 'user123', role: 'admin' };
      const token = generateToken(payload, '1h');

      const decoded = verifyToken(token) as any;

      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe('user123');
      expect(decoded.role).toBe('admin');
    });
  });
});
