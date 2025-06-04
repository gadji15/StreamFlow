import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient> | undefined = undefined;

// Singleton pattern to avoid multiple clients in the same browser context
if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!window.__supabase) {
    // @ts-ignore
    window.__supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  // @ts-ignore
  supabase = window.__supabase;
} else {
  // SSR fallback
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
