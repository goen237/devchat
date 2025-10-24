/**
 * Unit Tests: Auth Service
 * Testet Registrierung, Login und Token-Generierung
 */

import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser 
} from '../setup';
import { registerUser, loginUser } from '../../src/services/auth.service';
import { hashPassword } from '../../src/utils/password';

describe('Auth Service - Unit Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('registerUser()', () => {
    it('should register a new user successfully', async () => {
      const username = 'newuser';
      const email = 'newuser@example.com';
      const password = 'SecurePass123!';
      const semester = 3;

      const user = await registerUser(username, email, password, semester);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.semester).toBe(semester);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(password); // Passwort sollte gehasht sein
    });

    it('should throw error if user already exists', async () => {
      const email = 'existing@example.com';
      await createTestUser({ email });

      await expect(
        registerUser('newuser', email, 'password', 3)
      ).rejects.toThrow('User exists');
    });

    it('should hash the password', async () => {
      const password = 'TestPassword123!';
      const user = await registerUser('user', 'user@example.com', password, 2);

      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(password);
      expect(user.passwordHash.length).toBeGreaterThan(20); // Bcrypt Hash ist lang
    });

    it('should set isGoogleUser to false by default', async () => {
      const user = await registerUser('user', 'user@example.com', 'password', 1);
      expect(user.isGoogleUser).toBe(false);
    });
  });

  describe('loginUser()', () => {
    it('should login with valid credentials', async () => {
      const email = 'login@example.com';
      const password = 'ValidPassword123!';
      const passwordHash = await hashPassword(password);
      
      await createTestUser({ 
        email, 
        passwordHash,
        username: 'loginuser' 
      });

      const result = await loginUser(email, password);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.').length).toBe(3); // JWT hat 3 Teile
    });

    it('should throw error with invalid email', async () => {
      await expect(
        loginUser('nonexistent@example.com', 'password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      const email = 'user@example.com';
      const passwordHash = await hashPassword('correctpassword');
      
      await createTestUser({ email, passwordHash });

      await expect(
        loginUser(email, 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return a valid JWT token', async () => {
      const email = 'jwt@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);
      
      await createTestUser({ email, passwordHash });

      const result = await loginUser(email, password);
      
      // JWT Format: header.payload.signature
      const parts = result.token.split('.');
      expect(parts.length).toBe(3);
      
      // Decode payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.userId).toBe(result.user.id);
    });
  });
});
