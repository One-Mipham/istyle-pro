import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp, registerAuthHook, authHeaders } from './helpers';
import { errorHandler } from '../middleware/error-handler';

const { mockSupabaseAdmin } = vi.hoisted(() => ({
  mockSupabaseAdmin: { from: vi.fn() },
}));

vi.mock('../lib/supabase', () => ({ supabaseAdmin: mockSupabaseAdmin }));

describe('User Routes', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock the fetch call in authenticate middleware (calls Supabase auth/v1/user)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u-1' }),
    } as Response);

    const { userRoutes } = await import('../routes/users');
    app = buildApp();
    app.setErrorHandler(errorHandler);
    await app.register(userRoutes, { prefix: '/api/users' });
    await app.ready();
  });

  describe('GET /api/users/me', () => {
    it('returns profile for authenticated user', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'u-1', email: 'test@example.com', gender: 'male',
            age: 30, height_cm: 180, weight_kg: 75,
            preferred_styles: ['sport'], avatar_url: null,
            created_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        }),
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: { authorization: 'Bearer test-token' },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).user.email).toBe('test@example.com');
    });

    it('returns 404 when profile not found', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: { authorization: 'Bearer test-token' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('updates profile fields', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'u-1', email: 'test@example.com', gender: 'female',
            age: 29, height_cm: 170, weight_kg: 60,
            preferred_styles: ['casual', 'formal'], avatar_url: null,
            created_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        }),
      });

      const res = await app.inject({
        method: 'PATCH',
        url: '/api/users/me',
        headers: { authorization: 'Bearer test-token' },
        payload: { gender: 'female', age: 29 },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).user.gender).toBe('female');
      expect(JSON.parse(res.body).user.age).toBe(29);
    });

    it('returns 400 for invalid update data', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/users/me',
        headers: { authorization: 'Bearer test-token' },
        payload: { age: -1 },
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
