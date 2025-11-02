jest.mock('../../src/services/user.service', () => ({
  getAllUsersService: jest.fn()
}));

import { getAllUsers } from '../../src/controllers/user.controller';
import { getAllUsersService } from '../../src/services/user.service';

describe('user.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getAllUsers success', async () => {
    (getAllUsersService as jest.Mock).mockResolvedValue([{ id: 'u1' }]);
    const json = jest.fn();
    const res: any = { json };
    await getAllUsers({} as any, res);
    expect(json).toHaveBeenCalledWith([{ id: 'u1' }]);
  });

  test('getAllUsers failure', async () => {
    (getAllUsersService as jest.Mock).mockRejectedValue(new Error('boom'));
    const json = jest.fn(); const status = jest.fn(() => ({ json }));
    const res: any = { status, json };
    await getAllUsers({} as any, res);
    expect(status).toHaveBeenCalledWith(500);
  });
});
