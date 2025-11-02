
jest.mock('../../src/config/redis', () => ({
  isRedisConnected: jest.fn(),
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    pTTL: jest.fn(),
    incr: jest.fn()
  }
}));

import { authRateLimit } from '../../src/middleware/rateLimit';
import * as redisModule from '../../src/config/redis';
const isRedisConnected = redisModule.isRedisConnected as jest.MockedFunction<any>;
const redisClient = redisModule.redisClient as any;

describe('rateLimit middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  test('skips rate limit when redis not connected', async () => {
    // @ts-ignore
    // (isRedisConnected as any) = false;
    isRedisConnected.mockReturnValue(false);

    const req: any = { headers: {}, socket: { remoteAddress: '1.2.3.4' } };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();

    await (authRateLimit as any)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('first request sets key and calls next', async () => {
  // patch mocked module
  isRedisConnected.mockReturnValue(true);
  redisClient.get.mockResolvedValue(null);
  redisClient.set.mockResolvedValue('OK');

    const req: any = { headers: {}, socket: { remoteAddress: '1.2.3.5' } };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();

    await (authRateLimit as any)(req, res, next);
    expect((redisClient as any).set).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
    expect(next).toHaveBeenCalled();
  });

  test('when limit exceeded responds 429', async () => {
  // patch module
  isRedisConnected.mockReturnValue(true);
  redisClient.get.mockResolvedValue('5');
  redisClient.pTTL.mockResolvedValue(60000);

    const req: any = { headers: {}, socket: { remoteAddress: '1.2.3.6' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { setHeader: jest.fn(), status };
    const next = jest.fn();

    await (authRateLimit as any)(req, res, next);
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
