import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DAILY_FREE_QUOTA } from '@istyle/shared';

// Mock supabaseAdmin before importing the module under test
const mockSupabaseAdmin = {
  from: vi.fn(),
};

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

describe('checkAndReserveQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new free subscription and reserves one use when no subscription exists', async () => {
    const { checkAndReserveQuota } = await import('../lib/quota');

    // First call: no subscription found
    mockSupabaseAdmin.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    });

    // Insert a new subscription
    mockSupabaseAdmin.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'sub-1', plan: 'free', daily_remaining: DAILY_FREE_QUOTA },
      }),
    });

    // Update the new subscription's remaining count
    mockSupabaseAdmin.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await checkAndReserveQuota('user-1');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(DAILY_FREE_QUOTA - 1);
    expect(result.tier).toBe('free');
  });

  it('returns not allowed when free quota is exhausted', async () => {
    const { checkAndReserveQuota } = await import('../lib/quota');

    mockSupabaseAdmin.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { plan: 'free', daily_remaining: 0 },
      }),
    });

    const result = await checkAndReserveQuota('user-1');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.tier).toBe('free');
  });

  it('decrements remaining for free tier users with quota left', async () => {
    const { checkAndReserveQuota } = await import('../lib/quota');

    mockSupabaseAdmin.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { plan: 'free', daily_remaining: 2 },
      }),
    });

    mockSupabaseAdmin.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await checkAndReserveQuota('user-1');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
    expect(result.tier).toBe('free');
  });

  it('always allows pro users with remaining -1', async () => {
    const { checkAndReserveQuota } = await import('../lib/quota');

    mockSupabaseAdmin.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { plan: 'pro_monthly', daily_remaining: -1 },
      }),
    });

    const result = await checkAndReserveQuota('user-1');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1);
    expect(result.tier).toBe('pro_monthly');
  });

  it('handles insert failure gracefully', async () => {
    const { checkAndReserveQuota } = await import('../lib/quota');

    mockSupabaseAdmin.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    });

    mockSupabaseAdmin.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    });

    const result = await checkAndReserveQuota('user-1');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.tier).toBe('free');
  });
});
