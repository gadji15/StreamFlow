'use client';
import React from 'react';
import { supabase } from '@/lib/supabaseClient';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  async componentDidCatch(error: any, errorInfo: any) {
    this.setState({ hasError: true });
    // Log vers Supabase
    try {
      const user = await supabase.auth.getUser();
      await supabase.from('error_logs').insert([{
        user_id: user?.data?.user?.id || null,
        location: errorInfo?.componentStack || 'unknown',
        error_message: error?.message || String(error),
        error_stack: error?.stack || null
      }]);
    } catch (e) {
      // Ignore logging error
    }
    // Log aussi dans la console
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Une erreur s'est produite. Merci de recharger la page.</div>;
    }
    return this.props.children;
  }
}