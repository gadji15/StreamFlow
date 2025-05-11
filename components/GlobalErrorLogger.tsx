'use client'
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function GlobalErrorLogger() {
  useEffect(() => {
    const handler = async (event: ErrorEvent) => {
      try {
        const user = await supabase.auth.getUser();
        await supabase.from('error_logs').insert([{
          user_id: user?.data?.user?.id || null,
          location: 'window.onerror',
          error_message: event.message,
          error_stack: event.error?.stack || null,
          error_type: 'js',
          severity: 'error',
          url: window.location.href,
          user_agent: navigator.userAgent,
          environment: process.env.NODE_ENV || 'production',
          http_status: null,
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        }]);
      } catch (e) {
        // Ignore logging error
      }
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  return null;
}