import { supabaseAdmin } from './supabase.js';
import { DAILY_FREE_QUOTA } from '@istyle/shared';
import type { PlanTier } from '@istyle/shared';

export async function checkAndReserveQuota(userId: string): Promise<{ allowed: boolean; remaining: number; tier: PlanTier }> {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, daily_remaining')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) {
    const { data: newSub } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: userId, plan: 'free', daily_remaining: DAILY_FREE_QUOTA, status: 'active' })
      .select()
      .single();

    if (!newSub) {
      return { allowed: false, remaining: 0, tier: 'free' };
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({ daily_remaining: DAILY_FREE_QUOTA - 1 })
      .eq('id', newSub.id);

    return { allowed: true, remaining: DAILY_FREE_QUOTA - 1, tier: 'free' as PlanTier };
  }

  const tier = sub.plan as PlanTier;

  if (tier === 'free' && sub.daily_remaining <= 0) {
    return { allowed: false, remaining: 0, tier };
  }

  if (tier === 'free') {
    await supabaseAdmin
      .from('subscriptions')
      .update({ daily_remaining: sub.daily_remaining - 1 })
      .eq('user_id', userId);
    return { allowed: true, remaining: sub.daily_remaining - 1, tier };
  }

  return { allowed: true, remaining: -1, tier };
}
