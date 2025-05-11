'use client'
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function GlobalErrorLogger() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      supabase.from('error_logs').insert([{
        user_id: null,
        location: 'window.onerror',
        error_message: event.message,
        error_stack: event.error?.stack || null
      }]);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  return null;
}