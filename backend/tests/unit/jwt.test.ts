// Unit tests for src/utils/jwt.ts

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload: any, secret: string, opts: any) => `token-${JSON.stringify(payload)}`),
  verify: jest.fn((token: string, secret: string) => {
    if (token.startsWith('token-')) return JSON.parse(token.replace(/^token-/, ''));
    throw new Error('invalid token');
  })
}));

import { generateToken, verifyToken } from '../../src/utils/jwt';

describe('jwt util', () => {
  test('generateToken returns token string from mocked sign', () => {
    const token = generateToken({ sub: 1 }, '1h');
    expect(typeof token).toBe('string');
    expect(token).toContain('token-');
  });

  test('verifyToken returns decoded payload for valid token', () => {
    const payload = { sub: 42, name: 'Bob' };
    const token = generateToken(payload, '1h');
    const decoded = verifyToken(token as string);
    expect(decoded).toMatchObject(payload);
  });

  test('verifyToken returns null for invalid token', () => {
    const decoded = verifyToken('not-a-token');
    expect(decoded).toBeNull();
  });
});
