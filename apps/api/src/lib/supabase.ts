import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Client for auth operations — DO NOT use for DB queries (signInWithPassword pollutes it)
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Dedicated admin client for DB queries — NEVER used for auth, stays clean
export const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
