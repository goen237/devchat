// Unit tests for src/utils/cache.ts

// Mock the redis config module used by the cache utility
const mockSetEx = jest.fn();
const mockGet = jest.fn();
const mockDel = jest.fn();
const mockKeys = jest.fn();

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    setEx: mockSetEx,
    get: mockGet,
    del: mockDel,
    keys: mockKeys
  },
  isRedisConnected: jest.fn(() => true)
}));

import * as redisConfig from '../../src/config/redis';
import { setCache, getCache, deleteCache, deleteCachePattern, cacheWrapper } from '../../src/utils/cache';

describe('cache util (with mocked redis)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setCache calls redisClient.setEx when connected', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    await setCache('key1', { a: 1 }, 60);
    expect(mockSetEx).toHaveBeenCalled();
    const [key, ttl, value] = mockSetEx.mock.calls[0];
    expect(key).toBe('key1');
    expect(ttl).toBe(60);
    expect(JSON.parse(value)).toEqual({ a: 1 });
  });

  test('getCache returns parsed value on hit', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    mockGet.mockResolvedValueOnce(JSON.stringify({ b: 2 }));
    const res = await getCache('key2');
    expect(mockGet).toHaveBeenCalledWith('key2');
    expect(res).toEqual({ b: 2 });
  });

  test('getCache returns null on miss', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    mockGet.mockResolvedValueOnce(null);
    const res = await getCache('key-miss');
    expect(res).toBeNull();
  });

  test('deleteCache calls del when connected', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    await deleteCache('to-delete');
    expect(mockDel).toHaveBeenCalledWith('to-delete');
  });

  test('deleteCachePattern deletes found keys', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    mockKeys.mockResolvedValueOnce(['a', 'b']);
    await deleteCachePattern('pattern:*');
    expect(mockKeys).toHaveBeenCalledWith('pattern:*');
    expect(mockDel).toHaveBeenCalledWith(['a', 'b']);
  });

  test('cacheWrapper returns cached value on hit and avoids fetchFunction', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    mockGet.mockResolvedValueOnce(JSON.stringify({ cached: true }));
    const fetchFn = jest.fn(async () => ({ fetched: true }));
    const res = await cacheWrapper('cw:key', fetchFn, 10);
    expect(res).toEqual({ cached: true });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  test('cacheWrapper on miss calls fetchFunction and sets cache', async () => {
    (redisConfig.isRedisConnected as jest.Mock).mockReturnValue(true);
    mockGet.mockResolvedValueOnce(null);
    const fetchFn = jest.fn(async () => ({ fetched: 123 }));
    const res = await cacheWrapper('cw:miss', fetchFn, 120);
    expect(res).toEqual({ fetched: 123 });
    expect(fetchFn).toHaveBeenCalled();
    expect(mockSetEx).toHaveBeenCalled();
    const [key, ttl, value] = mockSetEx.mock.calls[0];
    expect(key).toBe('cw:miss');
    expect(ttl).toBe(120);
    expect(JSON.parse(value)).toEqual({ fetched: 123 });
  });
});
