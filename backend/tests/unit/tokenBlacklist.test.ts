// Unit tests for tokenBlacklist.service

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    set: jest.fn(),
    exists: jest.fn()
  },
  isRedisConnected: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn()
}));

import { blacklistToken, isTokenBlacklisted } from '../../src/services/tokenBlacklist.service';
import * as redisConfig from '../../src/config/redis';
import * as jwt from 'jsonwebtoken';

describe('tokenBlacklist service', () => {
  const sampleToken = 'abc.def.ghi';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('blacklistToken skips when redis not connected', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(false);
    await expect(blacklistToken(sampleToken)).resolves.toBeUndefined();
    expect(redisConfig.redisClient.set).not.toHaveBeenCalled();
  });

  test('blacklistToken stores token with EX TTL when token has exp in future', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    // mock current time to a fixed value
    const nowMs = 1_700_000_000_000; // arbitrary
    jest.spyOn(Date, 'now').mockReturnValue(nowMs);

    // decoded.exp is in seconds
    const expSeconds = Math.floor(nowMs / 1000) + 120; // expires in 120s
    (jwt.decode as jest.Mock).mockReturnValue({ exp: expSeconds });

    await blacklistToken(sampleToken);

    // TTL should be approximately 120
    expect(redisConfig.redisClient.set).toHaveBeenCalledTimes(1);
    const [key, value, opts] = (redisConfig.redisClient.set as jest.Mock).mock.calls[0];
    expect(key).toBe(`blacklist:${sampleToken}`);
    expect(value).toBe('logged_out');
    expect(opts).toEqual({ EX: expSeconds - Math.floor(nowMs / 1000) });
  });

  test('blacklistToken stores token with 24h when no exp present', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    (jwt.decode as jest.Mock).mockReturnValue(null);

    await blacklistToken(sampleToken);
    expect(redisConfig.redisClient.set).toHaveBeenCalledWith(`blacklist:${sampleToken}`, 'logged_out', { EX: 86400 });
  });

  test('isTokenBlacklisted returns false when redis not connected', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(false);
    const res = await isTokenBlacklisted(sampleToken);
    expect(res).toBe(false);
  });

  test('isTokenBlacklisted returns true when exists returns 1', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    (redisConfig.redisClient.exists as jest.Mock).mockResolvedValue(1);
    const res = await isTokenBlacklisted(sampleToken);
    expect(res).toBe(true);
  });

  test('isTokenBlacklisted returns false when exists returns 0', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    (redisConfig.redisClient.exists as jest.Mock).mockResolvedValue(0);
    const res = await isTokenBlacklisted(sampleToken);
    expect(res).toBe(false);
  });
});
