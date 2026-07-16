import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiRequestError, setToken, api } from '../lib/api';

describe('ApiRequestError', () => {
  it('stores message, statusCode, and code', () => {
    const err = new ApiRequestError('Not Found', 404, 'not_found');
    expect(err.message).toBe('Not Found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('not_found');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken(null);
    globalThis.fetch = vi.fn();
  });

  it('sends a GET request with JSON headers', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'ok' }),
    } as Response);

    const res = await api('/api/styles');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/styles',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(res).toEqual({ data: 'ok' });
  });

  it('attaches Authorization header when token is set', async () => {
    setToken('test-token-123');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: {} }),
    } as Response);

    await api('/api/users/me');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/me',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-123',
        },
      }),
    );
  });

  it('throws ApiRequestError on non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'quota_exceeded',
        message: 'Daily free quota exhausted',
        statusCode: 429,
      }),
    } as Response);

    try {
      await api('/api/generate', { method: 'POST', body: '{}' });
      expect.unreachable('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiRequestError);
      expect(e).toMatchObject({
        message: 'Daily free quota exhausted',
        statusCode: 429,
        code: 'quota_exceeded',
      });
    }
  });

  it('falls back to res.status when body has no statusCode', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    } as Response);

    await expect(api('/api/test')).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it('uses default message when body has none', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    } as Response);

    await expect(api('/api/test')).rejects.toMatchObject({
      message: 'Request failed',
    });
  });
});

describe('setToken', () => {
  beforeEach(() => {
    setToken(null);
  });

  it('sets and clears the token', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    setToken('abc');
    await api('/api/test');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer abc' }),
      }),
    );

    setToken(null);
    vi.clearAllMocks();
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await api('/api/test');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
});
