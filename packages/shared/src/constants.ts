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
