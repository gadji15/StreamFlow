import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type Season = {
  id: string;
  series_id: string;
  season_number: number;
  title?: string | null;
  description?: string | null;
  poster?: string | null;
  air_date?: string | null;
  tmdb_id?: number | null;
  episode_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UseSeasonsOptions = {
  onError?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
};

export function useSeasons(seriesId: string, opts: UseSeasonsOptions = {}) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('series_id', seriesId)
      .order('season_number', { ascending: true });
    setSeasons(data || []);
    if (error && opts.onError) opts.onError('Erreur lors du chargement des saisons');
    setLoading(false);
  }, [seriesId, opts]);

  // Ajout avec vérification anti-doublon front + gestion duplicata SQL
  const addSeason = useCallback(async (input: Omit<Season, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    // Anti-doublon front
    const { count } = await supabase
      .from('seasons')
      .select('id', { count: 'exact', head: true })
      .eq('series_id', seriesId)
      .eq('season_number', input.season_number);
    if (count && count > 0) {
      if (opts.onError) opts.onError('Cette saison existe déjà.');
      setLoading(false);
      return false;
    }
    const { error } = await supabase
      .from('seasons')
      .insert([{ ...input, series_id: seriesId }]);
    if (error) {
      if (
        error.code === '23505' ||
        (error.message && error.message.toLowerCase().includes('unique'))
      ) {
        if (opts.onError) opts.onError('Doublon : cette saison existe déjà.');
      } else if (opts.onError) {
        opts.onError('Erreur lors de l\'ajout de la saison.');
      }
      setLoading(false);
      return false;
    }
    if (opts.onSuccess) opts.onSuccess('Saison ajoutée avec succès');
    await fetchSeasons();
    setLoading(false);
    return true;
  }, [seriesId, fetchSeasons, opts]);

  // Modification
  const updateSeason = useCallback(async (id: string, data: Partial<Season>) => {
    setLoading(true);
    const { error } = await supabase
      .from('seasons')
      .update(data)
      .eq('id', id);
    if (error) {
      if (opts.onError) opts.onError('Erreur lors de la modification de la saison.');
      setLoading(false);
      return false;
    }
    if (opts.onSuccess) opts.onSuccess('Saison modifiée avec succès');
    await fetchSeasons();
    setLoading(false);
    return true;
  }, [fetchSeasons, opts]);

  // Suppression
  const deleteSeason = useCallback(async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', id);
    if (error) {
      if (opts.onError) opts.onError('Erreur lors de la suppression de la saison.');
      setLoading(false);
      return false;
    }
    if (opts.onSuccess) opts.onSuccess('Saison supprimée');
    await fetchSeasons();
    setLoading(false);
    return true;
  }, [fetchSeasons, opts]);

  return {
    seasons,
    loading,
    fetchSeasons,
    addSeason,
    updateSeason,
    deleteSeason,
  };
}