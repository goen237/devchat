import * as dotenv from 'dotenv';

// Load test environment variables (if present)
dotenv.config({ path: '.env.test' });

// Increase default jest timeout for slow operations in CI/local dev
jest.setTimeout(10000);

// Clear mocks between tests to avoid cross-test pollution
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

// Optionally export helpers later
export {};
