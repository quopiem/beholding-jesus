import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

// Auto-correct font/typing mistakes (e.g. '0QTB13' with zero & one instead of 'OQTBl3' with O & l)
if (rawAnonKey.includes('0QTB13')) {
  rawAnonKey = rawAnonKey.replace('0QTB13', 'OQTBl3');
}

// Fallback to designated live church credentials if blank or placeholder
const effectiveKey = (rawAnonKey && !rawAnonKey.includes('your-anon-key'))
  ? rawAnonKey
  : 'sb_publishable_kHVMAKw9XSrvQ69xIH2gmw_9RcvlYO6';

const effectiveUrl = (supabaseUrl && !supabaseUrl.includes('your-project'))
  ? supabaseUrl
  : 'https://rpeevqhwwbqixuaxhsot.supabase.co';

export const isSupabaseConfigured = Boolean(effectiveUrl && effectiveKey);

export const supabase = isSupabaseConfigured
  ? createClient(effectiveUrl, effectiveKey)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase credentials not configured. Running in offline-first mode.'
  );
}
