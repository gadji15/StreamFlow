'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

export default function AddEpisodePage() {
  const router = useRouter();
  // @ts-ignore
  const { id, seasonId } = useParams(); // id = id de la série
  const { toast } = useToast();

  // États du formulaire
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState('');
  const [airDate, setAirDate] = useState('');
  const [runtime, setRuntime] = useState<number | ''>('');
  const [tmdbId, setTmdbId] = useState<number | ''>('');
  const [voteAverage, setVoteAverage] = useState<number | ''>('');
  const [voteCount, setVoteCount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !seasonId || !episodeNumber || !title) {
      toast({ title: 'Erreur', description: 'Série, saison, numéro et titre obligatoires.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      // Vérification anti-doublon (season_id + episode_number)
      const { data: existing, error: checkError } = await supabase
        .from('episodes')
        .select('id')
        .eq('season_id', seasonId)
        .eq('episode_number', episodeNumber)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Doublon détecté",
          description: "Un épisode avec ce numéro existe déjà pour cette saison.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.from('episodes').insert([{
        series_id: id,
        season_id: seasonId,
        episode_number: episodeNumber,
        title,
        description: description || null,
        poster: poster || null,
        air_date: airDate || null,
        runtime: runtime || null,
        tmdb_id: tmdbId || null,
        vote_average: voteAverage || null,
        vote_count: voteCount || null,
      }]);
      if (error) {
        if (
          error.code === "23505" ||
          (typeof error.message === "string" && error.message.toLowerCase().includes("unique"))
        ) {
          toast({
            title: "Doublon détecté",
            description: "Un épisode avec ce numéro existe déjà pour cette saison.",
            variant: "destructive",
          });
        } else {
          toast({ title: 'Erreur', description: "Impossible d'ajouter l'épisode.", variant: 'destructive' });
        }
        setIsSubmitting(false);
        return;
      }

      toast({ title: 'Épisode ajouté', description: `Épisode ${episodeNumber} créé avec succès.` });
      router.push(`/admin/series/${id}/seasons/${seasonId}`);
    } catch (error) {
      toast({ title: 'Erreur', description: "Impossible d'ajouter l'épisode.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter un épisode</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="episodeNumber">Numéro d'épisode *</Label>
          <Input
            id="episodeNumber"
            type="number"
            min={1}
            value={episodeNumber}
            onChange={e => setEpisodeNumber(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Titre *</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <Label htmlFor="poster">Poster (URL)</Label>
          <Input id="poster" value={poster} onChange={e => setPoster(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="airDate">Date de diffusion</Label>
          <Input id="airDate" type="date" value={airDate} onChange={e => setAirDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="runtime">Durée (minutes)</Label>
          <Input id="runtime" type="number" value={runtime} onChange={e => setRuntime(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label htmlFor="tmdbId">TMDB ID</Label>
          <Input id="tmdbId" type="number" value={tmdbId} onChange={e => setTmdbId(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label htmlFor="voteAverage">Note moyenne</Label>
          <Input id="voteAverage" type="number" step="0.1" value={voteAverage} onChange={e => setVoteAverage(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label htmlFor="voteCount">Nombre de votes</Label>
          <Input id="voteCount" type="number" value={voteCount} onChange={e => setVoteCount(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ajout en cours..." : "Ajouter l'épisode"}
          </Button>
        </div>
      </form>
    </div>
  );
}