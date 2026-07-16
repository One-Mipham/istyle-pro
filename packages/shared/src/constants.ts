export const DAILY_FREE_QUOTA = 3;

export const STYLE_CATEGORIES = ['hair', 'clothing'] as const;

export const SCENES = {
  work: '职业',
  sport: '运动',
  casual: '休闲',
  ceremony: '典礼',
  daily: '日常',
} as const satisfies Record<string, string>;

export const AGE_GROUPS = {
  kids: '儿童',
  teen: '少年',
  young: '青年',
  middle: '中年',
  senior: '老年',
} as const satisfies Record<string, string>;

export const GENERATION_TIMEOUT_MS = 60_000;
export const POLL_INTERVAL_MS = 2_000;
export const MAX_RETRIES = 3;

// ── Pricing (CNY ¥) ──
export const PRICING: Record<string, { amount: number; currency: string; label: string; period: string; dailyGenerations: number; originalAmount?: number; discount?: string; isOneTime?: boolean }> = {
  pro_monthly: { amount: 9.9, currency: 'CNY', label: 'Pro 月度', period: 'month', dailyGenerations: -1 },
  pro_yearly: { amount: 69, currency: 'CNY', label: 'Pro 年度', period: 'year', dailyGenerations: -1, originalAmount: 118.8, discount: '42%' },
  lifetime: { amount: 98, currency: 'CNY', label: '永久买断', period: 'forever', dailyGenerations: -1, isOneTime: true },
};

export const PLAN_LIMITS = {
  free: { dailyGenerations: 3, concurrentGenerations: 1, historyDays: 7 },
  pro_monthly: { dailyGenerations: -1, concurrentGenerations: 2, historyDays: 90 },
  pro_yearly: { dailyGenerations: -1, concurrentGenerations: 3, historyDays: 365 },
  lifetime: { dailyGenerations: -1, concurrentGenerations: 5, historyDays: -1 },
} as const;

// ── Trial ──
export const TRIAL_DAYS = 7;
export const TRIAL_DAILY_QUOTA = 10;
export const REFUND_WINDOW_DAYS = 7;
