'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

export default function AddSeasonPage() {
  const router = useRouter();
  // @ts-ignore
  const { id } = useParams(); // récupère l'id de la série depuis l'URL
  const { toast } = useToast();

  // États du formulaire
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState('');
  const [airDate, setAirDate] = useState('');
  const [tmdbId, setTmdbId] = useState<number | ''>('');
  const [episodeCount, setEpisodeCount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !seasonNumber) {
      toast({ title: 'Erreur', description: 'Série et numéro de saison obligatoires (id manquant).', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      // Vérification préalable pour éviter les doublons (series_id + season_number)
      const { data: existing, error: checkError } = await supabase
        .from('seasons')
        .select('id')
        .eq('series_id', id)
        .eq('season_number', seasonNumber)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Doublon détecté",
          description: "Une saison avec ce numéro existe déjà pour cette série.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.from('seasons').insert([{
        series_id: id,
        season_number: seasonNumber,
        title: title || null,
        description: description || null,
        poster: poster || null,
        air_date: airDate || null,
        tmdb_id: tmdbId || null,
        episode_count: episodeCount || null,
      }]);
      if (error) {
        if (
          error.code === "23505" ||
          (typeof error.message === "string" && error.message.toLowerCase().includes("unique"))
        ) {
          toast({
            title: "Doublon détecté",
            description: "Une saison avec ce numéro existe déjà pour cette série.",
            variant: "destructive",
          });
        } else {
          toast({ title: 'Erreur', description: "Impossible d'ajouter la saison.", variant: 'destructive' });
        }
        setIsSubmitting(false);
        return;
      }

      toast({ title: 'Saison ajoutée', description: `Saison ${seasonNumber} créée avec succès.` });
      router.push(`/admin/series/${id}`);
    } catch (error) {
      toast({ title: 'Erreur', description: "Impossible d'ajouter la saison.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter une saison</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="seasonNumber">Numéro de saison *</Label>
          <Input
            id="seasonNumber"
            type="number"
            min={1}
            value={seasonNumber}
            onChange={e => setSeasonNumber(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
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
          <Label htmlFor="tmdbId">TMDB ID</Label>
          <Input id="tmdbId" type="number" value={tmdbId} onChange={e => setTmdbId(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <Label htmlFor="episodeCount">Nombre d'épisodes</Label>
          <Input id="episodeCount" type="number" value={episodeCount} onChange={e => setEpisodeCount(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ajout en cours..." : "Ajouter la saison"}
          </Button>
        </div>
      </form>
    </div>
  );
}