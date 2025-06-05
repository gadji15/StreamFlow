import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from './useSupabaseAuth';

// Nouvelle version adaptée à la structure réelle de view_history
export type WatchHistoryItem = {
  id: string;
  user_id: string;
  film_id?: string | null;
  series_id?: string | null;
  episode_id?: string | null;
  watched_at: string;
  progress: number | null;
  completed: boolean;
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
      .order('watched_at', { ascending: false });
    if (error) setError(error.message);
    setHistory(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Add or update a view history entry (auto-infers type/id)
  const upsertHistory = async ({
    film_id,
    series_id,
    episode_id,
    progress,
    completed,
  }: {
    film_id?: string;
    series_id?: string;
    episode_id?: string;
    progress: number;
    completed: boolean;
  }) => {
    if (!user) return;
    const entry: any = {
      user_id: user.id,
      progress,
      completed,
      watched_at: new Date().toISOString(),
    };
    if (film_id) entry.film_id = film_id;
    if (series_id) entry.series_id = series_id;
    if (episode_id) entry.episode_id = episode_id;

    // OnConflict: only allow one entry per user/content
    const onConflict = film_id
      ? 'user_id,film_id'
      : series_id
      ? 'user_id,series_id'
      : 'user_id,episode_id';

    const { error } = await supabase
      .from('view_history')
      .upsert([entry], { onConflict });
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