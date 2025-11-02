// Unit tests for AvatarService

jest.mock('../../src/config/data-source', () => ({ getDataSource: jest.fn() }));
jest.mock('../../src/utils/cache', () => ({ cacheWrapper: jest.fn(), deleteCache: jest.fn() }));
jest.mock('fs');

import fs from 'fs';
import { AvatarService } from '../../src/services/avatar.service';
import { getDataSource } from '../../src/config/data-source';
import { cacheWrapper, deleteCache } from '../../src/utils/cache';

describe('AvatarService', () => {
  let service: AvatarService;
  const userRepo: any = { findOne: jest.fn(), save: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDataSource as jest.Mock).mockReturnValue({ getRepository: () => userRepo });
    service = new AvatarService();
  });

  test('getPresetAvatars filters and maps files correctly', async () => {
    // @ts-ignore
    fs.readdirSync.mockReturnValue(['avatar1.jpg', 'simpsons_-_homer.svg', 'README.md', 'other.png']);

    const presets = await service.getPresetAvatars();
    expect(presets).toHaveLength(2);
    expect(presets.find(p => p.id === 'avatar1.jpg')!.name).toBe('Avatar 1');
    expect(presets.find(p => p.id === 'simpsons_-_homer.svg')!.name).toBe('Homer');
  });

  test('getAvailableAvatars uses cacheWrapper (cache miss path)', async () => {
    // Make cacheWrapper execute the fetch function
    (cacheWrapper as jest.Mock).mockImplementation(async (_key: string, fn: any) => fn());
    // mock readdirSync
    // @ts-ignore
    fs.readdirSync.mockReturnValue(['avatar2.jpg']);

    const list = await service.getAvailableAvatars();
    expect(list).toHaveLength(1);
    expect(cacheWrapper).toHaveBeenCalledWith('avatars:available', expect.any(Function), 3600);
  });

  test('selectAvatar saves avatar url on user and invalidates cache', async () => {
    (cacheWrapper as jest.Mock).mockImplementation(async (_key: string, fn: any) => fn());
    // @ts-ignore
    fs.readdirSync.mockReturnValue(['avatar2.jpg']);

    const user = { id: 'u1', avatarUrl: null };
    userRepo.findOne.mockResolvedValue(user);
    userRepo.save.mockResolvedValue({ ...user, avatarUrl: '/avatars/avatar2.jpg' });

    const res = await service.selectAvatar('u1', 'avatar2.jpg');
    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(userRepo.save).toHaveBeenCalled();
    expect(deleteCache).toHaveBeenCalledWith('profile:u1');
    expect(res.avatarUrl).toBe('/avatars/avatar2.jpg');
  });

  test('selectAvatar throws when avatar not found', async () => {
    (cacheWrapper as jest.Mock).mockImplementation(async (_key: string, fn: any) => fn());
    // @ts-ignore
    fs.readdirSync.mockReturnValue(['avatar3.jpg']);

    await expect(service.selectAvatar('u1', 'nonexistent.jpg')).rejects.toThrow('Avatar nicht gefunden');
  });

  test('getAvatarFile returns path when exists and throws when not', async () => {
    // @ts-ignore
    fs.existsSync.mockReturnValue(true);
    const path1 = await service.getAvatarFile('avatar2.jpg');
    expect(path1).toContain('avatars');

    // @ts-ignore
    fs.existsSync.mockReturnValue(false);
    await expect(service.getAvatarFile('nope.jpg')).rejects.toThrow('Avatar-Datei nicht gefunden');
  });
});
