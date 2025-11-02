// Unit tests for src/services/profile.service.ts

jest.mock('../../src/config/data-source', () => ({ getDataSource: jest.fn() }));
jest.mock('../../src/utils/cache', () => ({ cacheWrapper: jest.fn(), deleteCache: jest.fn() }));
jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

import { updateUserProfile, getUserProfile, updateUserPassword } from '../../src/services/profile.service';
import { getDataSource } from '../../src/config/data-source';
import * as cache from '../../src/utils/cache';
import bcrypt from 'bcrypt';

describe('profile.service', () => {
  const userRepo: any = {
    findOneByOrFail: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDataSource as jest.Mock).mockReturnValue({ getRepository: () => userRepo });
  });

  test('updateUserProfile updates fields and invalidates cache', async () => {
    const user = { id: 'u1', username: 'old', email: 'old@x', semester: 1 };
    userRepo.findOneByOrFail.mockResolvedValue(user);
    userRepo.findOne.mockResolvedValue(null); // no duplicates
    userRepo.save.mockResolvedValue({ ...user, username: 'new', email: 'new@x', semester: 2 });

    const res = await updateUserProfile('u1', { username: 'new', email: 'new@x', semester: 2 });
    expect(userRepo.save).toHaveBeenCalled();
    expect(cache.deleteCache).toHaveBeenCalledWith('profile:u1');
    expect(res).toEqual({ username: 'new', email: 'new@x', semester: 2 });
  });

  test('updateUserProfile throws when email exists', async () => {
    const user = { id: 'u1', username: 'old', email: 'old@x', semester: 1 };
    userRepo.findOneByOrFail.mockResolvedValue(user);
    userRepo.findOne.mockResolvedValue({ id: 'u2', email: 'new@x' });

    await expect(updateUserProfile('u1', { email: 'new@x' })).rejects.toThrow('Email ist bereits vergeben.');
  });

  test('getUserProfile delegates to cacheWrapper', async () => {
    (cache.cacheWrapper as jest.Mock).mockImplementation(async (_key: string, fn: any) => fn());
    userRepo.findOneByOrFail.mockResolvedValue({ id: 'u1', username: 'u', email: 'e@', semester: 3, avatarUrl: 'a.png' });

    const res = await getUserProfile('u1');
    expect(res).toEqual({ username: 'u', email: 'e@', semester: 3, avatarUrl: 'a.png' });
  });

  test('updateUserPassword throws on wrong old password', async () => {
    userRepo.findOneByOrFail.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(updateUserPassword('u1', { oldPassword: 'x', newPassword: 'y' })).rejects.toThrow('Das alte Passwort ist nicht korrekt.');
  });

  test('updateUserPassword hashes new password and saves', async () => {
    const user = { id: 'u1', passwordHash: 'oldhash' } as any;
    userRepo.findOneByOrFail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('newhash');
    userRepo.save.mockResolvedValue({ ...user, passwordHash: 'newhash' });

    const res = await updateUserPassword('u1', { oldPassword: 'old', newPassword: 'new' });
    expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
    expect(userRepo.save).toHaveBeenCalled();
    expect(res).toEqual({ message: 'Passwort erfolgreich geändert.' });
  });
});
