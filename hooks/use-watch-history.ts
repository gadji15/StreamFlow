import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from './useSupabaseAuth';

export type WatchHistoryItem = {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  progress: number | null;
  completed: boolean;
  updated_at: string;
};

export function useWatchHistory() {
  const { user } = useSupabaseAuth();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch watch history for current user
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('view_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) setError(error.message);
    setHistory(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Add or update a view history entry
  const upsertHistory = async ({
    content_id,
    content_type,
    progress,
    completed,
  }: {
    content_id: string;
    content_type: string;
    progress: number;
    completed: boolean;
  }) => {
    if (!user) return;
    const { error } = await supabase
      .from('view_history')
      .upsert(
        [{
          user_id: user.id,
          content_id,
          content_type,
          progress,
          completed,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: 'user_id,content_id,content_type' }
      );
    if (error) throw new Error(error.message);
    fetchHistory();
  };

  return {
    history,
    loading,
    error,
    refresh: fetchHistory,
    upsertHistory,
  };
}