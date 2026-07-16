import { describe, it, expect } from 'vitest';
import {
  DAILY_FREE_QUOTA,
  STYLE_CATEGORIES,
  SCENES,
  AGE_GROUPS,
  GENERATION_TIMEOUT_MS,
  POLL_INTERVAL_MS,
  MAX_RETRIES,
} from './constants';

describe('constants', () => {
  it('DAILY_FREE_QUOTA is a positive integer', () => {
    expect(Number.isInteger(DAILY_FREE_QUOTA)).toBe(true);
    expect(DAILY_FREE_QUOTA).toBeGreaterThan(0);
  });

  it('STYLE_CATEGORIES includes hair and clothing', () => {
    expect(STYLE_CATEGORIES).toContain('hair');
    expect(STYLE_CATEGORIES).toContain('clothing');
  });

  it('SCENES maps all five scenes to Chinese labels', () => {
    expect(SCENES).toHaveProperty('work', '职业');
    expect(SCENES).toHaveProperty('sport', '运动');
    expect(SCENES).toHaveProperty('casual', '休闲');
    expect(SCENES).toHaveProperty('ceremony', '典礼');
    expect(SCENES).toHaveProperty('daily', '日常');
  });

  it('AGE_GROUPS maps all five age groups to Chinese labels', () => {
    expect(AGE_GROUPS).toHaveProperty('kids', '儿童');
    expect(AGE_GROUPS).toHaveProperty('teen', '少年');
    expect(AGE_GROUPS).toHaveProperty('young', '青年');
    expect(AGE_GROUPS).toHaveProperty('middle', '中年');
    expect(AGE_GROUPS).toHaveProperty('senior', '老年');
  });

  it('GENERATION_TIMEOUT_MS is a positive integer', () => {
    expect(Number.isInteger(GENERATION_TIMEOUT_MS)).toBe(true);
    expect(GENERATION_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('POLL_INTERVAL_MS is a positive integer less than timeout', () => {
    expect(Number.isInteger(POLL_INTERVAL_MS)).toBe(true);
    expect(POLL_INTERVAL_MS).toBeGreaterThan(0);
    expect(POLL_INTERVAL_MS).toBeLessThan(GENERATION_TIMEOUT_MS);
  });

  it('MAX_RETRIES is a non-negative integer', () => {
    expect(Number.isInteger(MAX_RETRIES)).toBe(true);
    expect(MAX_RETRIES).toBeGreaterThanOrEqual(0);
  });
});
