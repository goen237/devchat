// Unit tests for user.service (getAllUsersService)

jest.mock('../../src/utils/cache', () => ({
  cacheWrapper: jest.fn()
}));

import { getAllUsersService } from '../../src/services/user.service';
import { cacheWrapper } from '../../src/utils/cache';

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllUsersService delegates to cacheWrapper and returns value', async () => {
    (cacheWrapper as jest.Mock).mockResolvedValue([{ id: 'u1', username: 'alice' }]);

    const res = await getAllUsersService();
    expect(cacheWrapper).toHaveBeenCalled();
    // First arg should be the cache key
    expect((cacheWrapper as jest.Mock).mock.calls[0][0]).toBe('users:all');
    expect(res).toEqual([{ id: 'u1', username: 'alice' }]);
  });
});
