import * as redisModule from '../../src/config/redis';

describe('redis config helpers', () => {
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // replace client methods with jest fns
    (redisModule.redisClient as any).connect = jest.fn().mockResolvedValue(undefined);
    (redisModule.redisClient as any).quit = jest.fn().mockResolvedValue(undefined);
    (redisModule.redisClient as any).setEx = jest.fn().mockResolvedValue('OK');
    (redisModule.redisClient as any).get = jest.fn().mockResolvedValue(null);
    (redisModule.redisClient as any).del = jest.fn().mockResolvedValue(1);
    (redisModule.redisClient as any).incr = jest.fn().mockResolvedValue(1);
    (redisModule.redisClient as any).expire = jest.fn().mockResolvedValue(1);
    // default isOpen false (redis client exposes isOpen as getter-only)
    Object.defineProperty(redisModule.redisClient as any, 'isOpen', { configurable: true, get: () => false });

    jest.clearAllMocks();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  test('isRedisConnected reflects client.isOpen', () => {
    Object.defineProperty(redisModule.redisClient as any, 'isOpen', { configurable: true, get: () => true });
    expect(redisModule.isRedisConnected()).toBe(true);

    Object.defineProperty(redisModule.redisClient as any, 'isOpen', { configurable: true, get: () => false });
    expect(redisModule.isRedisConnected()).toBe(false);
  });

  test('connectRedis returns early when already connected', async () => {
    Object.defineProperty(redisModule.redisClient as any, 'isOpen', { configurable: true, get: () => true });
    await redisModule.connectRedis();
    expect((redisModule.redisClient as any).connect).not.toHaveBeenCalled();
  });

  test('connectRedis calls connect when not connected', async () => {
    Object.defineProperty(redisModule.redisClient as any, 'isOpen', { configurable: true, get: () => false });
    await redisModule.connectRedis();
    expect((redisModule.redisClient as any).connect).toHaveBeenCalled();
  });

  test('connectRedis swallows errors from connect', async () => {
    Object.defineProperty(redisModule.redisClient as any, 'isOpen', { configurable: true, get: () => false });
    (redisModule.redisClient as any).connect = jest.fn().mockRejectedValue(new Error('conn fail'));
    await expect(redisModule.connectRedis()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  test('disconnectRedis calls quit and logs on success', async () => {
    (redisModule.redisClient as any).quit = jest.fn().mockResolvedValue(undefined);
    await redisModule.disconnectRedis();
    expect((redisModule.redisClient as any).quit).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  test('disconnectRedis logs on error and does not throw', async () => {
    (redisModule.redisClient as any).quit = jest.fn().mockRejectedValue(new Error('quit fail'));
    await expect(redisModule.disconnectRedis()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  test('setWithExpiry calls setEx and throws when setEx errors', async () => {
    await expect(redisModule.setWithExpiry('k', 'v', 60)).resolves.toBeUndefined();
    expect((redisModule.redisClient as any).setEx).toHaveBeenCalledWith('k', 60, 'v');

    (redisModule.redisClient as any).setEx = jest.fn().mockRejectedValue(new Error('set fail'));
    await expect(redisModule.setWithExpiry('k', 'v', 60)).rejects.toThrow('set fail');
  });

  test('get returns value or null on error', async () => {
    (redisModule.redisClient as any).get = jest.fn().mockResolvedValue('value');
    await expect(redisModule.get('k')).resolves.toBe('value');

    (redisModule.redisClient as any).get = jest.fn().mockRejectedValue(new Error('get fail'));
    await expect(redisModule.get('k')).resolves.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  test('del calls del and logs on error', async () => {
    (redisModule.redisClient as any).del = jest.fn().mockResolvedValue(1);
    await expect(redisModule.del('k')).resolves.toBeUndefined();

    (redisModule.redisClient as any).del = jest.fn().mockRejectedValue(new Error('del fail'));
    await expect(redisModule.del('k')).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  test('increment returns number and throws on error', async () => {
    (redisModule.redisClient as any).incr = jest.fn().mockResolvedValue(5);
    await expect(redisModule.increment('c')).resolves.toBe(5);

    (redisModule.redisClient as any).incr = jest.fn().mockRejectedValue(new Error('incr fail'));
    await expect(redisModule.increment('c')).rejects.toThrow('incr fail');
  });

  test('expire calls expire and logs on error', async () => {
    (redisModule.redisClient as any).expire = jest.fn().mockResolvedValue(1);
    await expect(redisModule.expire('k', 30)).resolves.toBeUndefined();

    (redisModule.redisClient as any).expire = jest.fn().mockRejectedValue(new Error('exp fail'));
    await expect(redisModule.expire('k', 30)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
