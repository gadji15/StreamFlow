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
    console.log("[useWatchHistory] fetchHistory: called", { user });
    if (!user) {
      console.log("[useWatchHistory] No user, abort fetchHistory");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('view_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false });
      console.log("[useWatchHistory] Supabase response", { data, error });
      if (error) setError(error.message);
      setHistory(data || []);
    } catch (err) {
      console.error("[useWatchHistory] Exception in fetchHistory", err);
      setError((err as Error).message || "Unknown error");
    } finally {
      setLoading(false);
      console.log("[useWatchHistory] fetchHistory: loading set to false");
    }
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

    // Détecter s'il existe déjà une ligne correspondante
    let existingRow = null;
    if (film_id) {
      const { data } = await supabase
        .from('view_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('film_id', film_id)
        .maybeSingle();
      existingRow = data;
    } else if (series_id) {
      const { data } = await supabase
        .from('view_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('series_id', series_id)
        .maybeSingle();
      existingRow = data;
    } else if (episode_id) {
      const { data } = await supabase
        .from('view_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('episode_id', episode_id)
        .maybeSingle();
      existingRow = data;
    }

    let error = null;
    if (existingRow && existingRow.id) {
      // update
      const { error: updateErr } = await supabase
        .from('view_history')
        .update(entry)
        .eq('id', existingRow.id);
      error = updateErr;
    } else {
      // insert
      const { error: insertErr } = await supabase
        .from('view_history')
        .insert([entry]);
      error = insertErr;
    }
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