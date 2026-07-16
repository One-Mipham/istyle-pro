import Fastify from 'fastify';
import { vi } from 'vitest';

/**
 * Build a minimal Fastify instance for integration testing.
 * Uses synchronous error handler import — vitest env vars are already set.
 */
export function buildApp() {
  const app = Fastify({ logger: false });

  // Silence error/warn/info logs during tests
  vi.spyOn(app.log, 'error').mockImplementation(() => {});
  vi.spyOn(app.log, 'warn').mockImplementation(() => {});
  vi.spyOn(app.log, 'info').mockImplementation(() => {});

  return app;
}

/**
 * Creates a test-only onRequest hook that sets request.userId
 * from the 'x-test-user-id' header (for inject() calls).
 */
export function registerAuthHook(app: ReturnType<typeof buildApp>) {
  app.addHook('onRequest', async (request) => {
    const uid = request.headers['x-test-user-id'];
    if (typeof uid === 'string') {
      request.userId = uid;
    }
  });
}

/**
 * Consistent mock user for tests.
 */
export const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  gender: 'female',
  age: 28,
  height_cm: 165,
  weight_kg: 55,
  preferred_styles: ['casual'],
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

/**
 * Build headers with a test user ID for inject() calls.
 */
export function authHeaders(userId = TEST_USER.id) {
  return { 'x-test-user-id': userId };
}
