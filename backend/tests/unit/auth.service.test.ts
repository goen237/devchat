// Unit tests for src/services/auth.service.ts

jest.mock('../../src/config/data-source', () => ({
  getDataSource: jest.fn()
}));

jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn(),
  comparePasswords: jest.fn()
}));

jest.mock('../../src/utils/jwt', () => ({
  generateToken: jest.fn()
}));

import { registerUser, loginUser, handleGoogleCallback } from '../../src/services/auth.service';
import { getDataSource } from '../../src/config/data-source';
import * as passwordUtils from '../../src/utils/password';
import * as jwtUtils from '../../src/utils/jwt';

describe('auth.service', () => {
  const fakeRepo: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Provide a fake DataSource.getRepository that returns our fakeRepo
    (getDataSource as jest.Mock).mockReturnValue({ getRepository: () => fakeRepo });
  });

  describe('registerUser', () => {
    test('throws if user already exists', async () => {
      fakeRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b' });
      await expect(registerUser('u', 'a@b', 'pw', 1)).rejects.toThrow('User exists');
      expect(fakeRepo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b' } });
    });

    test('creates and saves user when not existing', async () => {
      fakeRepo.findOne.mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed_pw');
      const createdUser = { username: 'u', email: 'a@b', passwordHash: 'hashed_pw', semester: 1 };
      fakeRepo.create.mockReturnValue(createdUser);
      fakeRepo.save.mockResolvedValue({ id: 'u1', ...createdUser });

  const res = await registerUser('u', 'a@b', 'pw', 1);
  expect(passwordUtils.hashPassword).toHaveBeenCalledWith('pw');
  expect(fakeRepo.create).toHaveBeenCalledWith({ username: 'u', email: 'a@b', passwordHash: 'hashed_pw', semester: 1 });
  expect(fakeRepo.save).toHaveBeenCalledWith(createdUser);
  // registerUser now returns the saved entity (with id)
  expect(res).toMatchObject({ id: 'u1', email: 'a@b' });
    });
  });

  describe('loginUser', () => {
    test('throws on missing user', async () => {
      fakeRepo.findOne.mockResolvedValue(null);
      await expect(loginUser('no@user', 'pw')).rejects.toThrow('Invalid credentials');
    });

    test('throws on invalid password', async () => {
      fakeRepo.findOne.mockResolvedValue({ id: 'u1', passwordHash: 'h' });
      (passwordUtils.comparePasswords as jest.Mock).mockResolvedValue(false);
      await expect(loginUser('a@b', 'wrong')).rejects.toThrow('Invalid credentials');
      expect(passwordUtils.comparePasswords).toHaveBeenCalledWith('wrong', 'h');
    });

    test('returns token and user on success', async () => {
      const user = { id: 'u1', email: 'a@b', username: 'bob', passwordHash: 'h' };
      fakeRepo.findOne.mockResolvedValue(user);
      (passwordUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('token-123');

      const { token, user: returnedUser } = await loginUser('a@b', 'pw');
      expect(passwordUtils.comparePasswords).toHaveBeenCalledWith('pw', 'h');
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({ userId: 'u1' }, '1h');
      expect(token).toBe('token-123');
      expect(returnedUser).toBe(user);
    });
  });

  describe('handleGoogleCallback', () => {
    test('redirects to login with error when no user', () => {
      const res: any = { redirect: jest.fn() };
      handleGoogleCallback(undefined, res as any);
      expect(res.redirect).toHaveBeenCalledWith('/login?error=NoUser');
    });

    test('redirects to frontend with token when user present', () => {
      const res: any = { redirect: jest.fn() };
      process.env.FRONTEND_URL = 'http://app.example';
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('tok-g');

      handleGoogleCallback({ id: '123' }, res as any);
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({ userId: '123' }, '1h');
      expect(res.redirect).toHaveBeenCalledWith('http://app.example/auth/callback?token=tok-g');
    });
  });
});
