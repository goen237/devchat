// Unit tests for src/utils/password.ts
// bcrypt is mocked to keep tests fast and deterministic

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (pw: string, rounds: number) => `hashed-${pw}`),
  compare: jest.fn(async (pw: string, hash: string) => hash === `hashed-${pw}`)
}));

import { hashPassword, comparePasswords } from '../../src/utils/password';

describe('password util', () => {
  test('hashPassword returns mocked hash', async () => {
    const hashed = await hashPassword('secret');
    expect(hashed).toBe('hashed-secret');
  });

  test('comparePasswords returns true for matching hash', async () => {
    const ok = await comparePasswords('secret', 'hashed-secret');
    expect(ok).toBe(true);
  });

  test('comparePasswords returns false for non-matching hash', async () => {
    const ok = await comparePasswords('secret', 'other-hash');
    expect(ok).toBe(false);
  });
});
