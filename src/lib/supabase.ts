/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Clean standard Supabase URL (strip /rest/v1/ or trailing slashes)
const env = (import.meta as any).env || {};
const rawUrl = env.VITE_SUPABASE_URL || 'https://pytnktxszkcnmgmrlaff.supabase.co';
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const SUPABASE_ANON_KEY = 
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1pmu2vQ5d8Lotefz-2qQXQ_r6qstVJa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message?: string }> {
  try {
    const { data, error } = await supabase.from('articles').select('count', { count: 'exact', head: true });
    if (error) {
      // Table might not exist yet, but connection to REST endpoint is live
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message.includes('relation "articles" does not exist')) {
        return { connected: true, message: 'Connected to Supabase (Database tables need initialization)' };
      }
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected and synchronized with Supabase' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Connection failed' };
  }
}
