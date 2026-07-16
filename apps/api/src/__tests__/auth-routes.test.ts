import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from './helpers';
import { errorHandler } from '../middleware/error-handler';

// Use vi.hoisted so mock objects are available when vi.mock factory runs (it hoists)
const { mockSupabase, mockSupabaseAdmin } = vi.hoisted(() => {
  const admin = {
    from: vi.fn(),
    auth: { admin: { createUser: vi.fn(), deleteUser: vi.fn(), listUsers: vi.fn(), updateUserById: vi.fn() } },
  };
  const client = {
    auth: { signInWithPassword: vi.fn(), admin: admin.auth.admin },
  };
  return { mockSupabase: client, mockSupabaseAdmin: admin };
});

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabaseAdmin,
}));

describe('Auth Routes — POST /api/auth/register', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { authRoutes } = await import('../routes/auth');
    app = buildApp();
    app.setErrorHandler(errorHandler);
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.ready();
  });

  it('returns 400 for invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'bad', password: '20001231', gender: 'male', age: 25, heightCm: 170, weightKg: 60, preferredStyles: ['casual'] },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('validation_error');
  });

  it('returns 400 for password not matching 8-digit pattern', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'a@b.com', password: 'abc', gender: 'male', age: 25, heightCm: 170, weightKg: 60, preferredStyles: ['casual'] },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('validation_error');
  });

  it('returns 400 when Supabase auth fails', async () => {
    mockSupabase.auth.admin.createUser.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email already in use' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'existing@test.com', password: '20001231', gender: 'female', age: 28, heightCm: 165, weightKg: 55, preferredStyles: ['casual'] },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('registration_failed');
  });

  it('registers successfully and returns profile', async () => {
    mockSupabase.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: 'u-1' } },
      error: null,
    });

    // Profile insert
    mockSupabaseAdmin.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'u-1', email: 'new@test.com', gender: 'female', age: 28,
          height_cm: 165, weight_kg: 55, preferred_styles: ['casual'],
          avatar_url: null, created_at: '2026-01-01T00:00:00Z',
        },
        error: null,
      }),
    });
    // Trial subscription insert
    mockSupabaseAdmin.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'new@test.com', password: '20001231', gender: 'female', age: 28, heightCm: 165, weightKg: 55, preferredStyles: ['casual'] },
    });
    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body).user.email).toBe('new@test.com');
  });

  it('cleans up auth user if profile insert fails', async () => {
    mockSupabase.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: 'u-rollback' } },
      error: null,
    });
    mockSupabase.auth.admin.deleteUser.mockResolvedValueOnce({ error: null });

    mockSupabaseAdmin.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'rollback@test.com', password: '20001231', gender: 'male', age: 30, heightCm: 175, weightKg: 70, preferredStyles: ['sport'] },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('profile_creation_failed');
    expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith('u-rollback');
  });
});

describe('Auth Routes — POST /api/auth/login', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { authRoutes } = await import('../routes/auth');
    app = buildApp();
    app.setErrorHandler(errorHandler);
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.ready();
  });

  it('returns 401 for invalid credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'bad@test.com', password: 'wrong' },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error).toBe('login_failed');
  });

  it('returns token and user on successful login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: 'u-1', email: 'test@example.com' },
        session: { access_token: 'jwt-token', refresh_token: 'refresh-token' },
      },
      error: null,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'test@example.com', password: 'anypassword' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).token).toBe('jwt-token');
    expect(JSON.parse(res.body).refreshToken).toBe('refresh-token');
  });
});

describe('Auth Routes — POST /api/auth/reset-password', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { authRoutes } = await import('../routes/auth');
    app = buildApp();
    app.setErrorHandler(errorHandler);
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.ready();
  });

  it('returns success even when email is not found (prevents enumeration)', async () => {
    mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValueOnce({
      data: { users: [] },
      error: null,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { email: 'unknown@test.com', newPassword: '20001231' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).message).toContain('If the email exists');
  });

  it('resets password when user is found', async () => {
    mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValueOnce({
      data: { users: [{ id: 'u-1', email: 'found@test.com' }] },
      error: null,
    });
    mockSupabaseAdmin.auth.admin.updateUserById.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { email: 'found@test.com', newPassword: '20001231' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).message).toContain('If the email exists');
  });
});
