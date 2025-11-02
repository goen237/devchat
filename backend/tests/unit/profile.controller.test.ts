jest.mock('../../src/services/profile.service', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  updateUserPassword: jest.fn()
}));

import { getProfile, updateProfile, updatePassword } from '../../src/controllers/profile.controller';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../../src/services/profile.service';

describe('profile.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getProfile returns 401 when no user', async () => {
    const req: any = {}; const json = jest.fn(); const status = jest.fn(() => ({ json }));
    const res: any = { status, json };
    await getProfile(req, res);
    expect(status).toHaveBeenCalledWith(401);
  });

  test('getProfile success', async () => {
    (getUserProfile as jest.Mock).mockResolvedValue({ id: 'u1', username: 'alice' });
    const req: any = { user: { id: 'u1' } };
    const json = jest.fn();
    const res: any = { json };
    await getProfile(req, res);
    expect(json).toHaveBeenCalledWith({ id: 'u1', username: 'alice' });
  });

  test('updateProfile unauthorized when no user', async () => {
    const req: any = { body: {} };
    const json = jest.fn(); const status = jest.fn(() => ({ json }));
    const res: any = { status, json };
    await updateProfile(req, res);
    expect(status).toHaveBeenCalledWith(401);
  });

  test('updateProfile success', async () => {
    (updateUserProfile as jest.Mock).mockResolvedValue({ id: 'u1', username: 'updated' });
    const req: any = { body: { username: 'updated' }, user: { id: 'u1' } };
    const json = jest.fn();
    const res: any = { json };
    await updateProfile(req, res);
    expect(json).toHaveBeenCalledWith({ id: 'u1', username: 'updated' });
  });

  test('updatePassword missing fields', async () => {
    const req: any = { body: { }, user: { id: 'u1' } };
    const json = jest.fn(); const status = jest.fn(() => ({ json }));
    const res: any = { status, json };
    await updatePassword(req, res);
    expect(status).toHaveBeenCalledWith(400);
  });

  test('updatePassword success and error path', async () => {
    (updateUserPassword as jest.Mock).mockResolvedValue({ id: 'u1' });
    const reqOk: any = { body: { oldPassword: 'a', newPassword: 'b' }, user: { id: 'u1' } };
    const resOk: any = { json: jest.fn() };
    await updatePassword(reqOk, resOk);
    expect(resOk.json).toHaveBeenCalled();

    (updateUserPassword as jest.Mock).mockRejectedValue(new Error('db error'));
    const reqErr: any = { body: { oldPassword: 'a', newPassword: 'b' }, user: { id: 'u1' } };
    const json = jest.fn(); const status = jest.fn(() => ({ json }));
    const resErr: any = { status, json };
    await updatePassword(reqErr, resErr);
    expect(status).toHaveBeenCalledWith(500);
  });
});
