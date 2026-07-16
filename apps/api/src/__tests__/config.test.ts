import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('config validation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('parses a valid environment', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb-secret-key');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8_test_token');

    const { config } = await import('../config');
    expect(config.PORT).toBe(3000);
    expect(config.HOST).toBe('0.0.0.0');
    expect(config.SUPABASE_URL).toBe('https://example.supabase.co');
    expect(config.REPLICATE_API_TOKEN).toBe('r8_test_token');
    expect(config.REPLICATE_MODEL).toBe('prunaai/z-image-turbo-img2img');
    expect(config.REDIS_URL).toBe('redis://localhost:6379');
    expect(config.WEEKLY_COST_LIMIT_USD).toBe(100);
  });

  it('applies defaults for optional fields', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb-secret-key');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8_test_token');

    const { config } = await import('../config');
    expect(config.PORT).toBe(3000);
    expect(config.HOST).toBe('0.0.0.0');
    expect(config.WEEKLY_COST_LIMIT_USD).toBe(100);
  });

  it('coerces numeric strings', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb-secret-key');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8_test_token');
    vi.stubEnv('PORT', '8080');
    vi.stubEnv('WEEKLY_COST_LIMIT_USD', '50');

    const { config } = await import('../config');
    expect(config.PORT).toBe(8080);
    expect(config.WEEKLY_COST_LIMIT_USD).toBe(50);
  });

  it('rejects invalid SUPABASE_URL', async () => {
    vi.stubEnv('SUPABASE_URL', 'not-a-valid-url');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb-secret-key');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8_test_token');

    await expect(import('../config')).rejects.toThrow();
  });

  it('rejects empty SUPABASE_SERVICE_ROLE_KEY', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8_test_token');

    await expect(import('../config')).rejects.toThrow();
  });

  it('rejects empty REPLICATE_API_TOKEN', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb-secret-key');
    vi.stubEnv('REPLICATE_API_TOKEN', '');

    await expect(import('../config')).rejects.toThrow();
  });
});
