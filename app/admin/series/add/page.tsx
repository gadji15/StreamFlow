'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tv,
  Info,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Plus,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const HOMEPAGE_CATEGORIES = [
  { key: 'featured', label: 'À la une' },
  { key: 'new', label: 'Nouveautés' },
  { key: 'top', label: 'Top' },
  { key: 'vip', label: 'VIP' },
];

import AdminPageContainer from '@/components/admin/AdminPageContainer';

export default function AdminAddSeriesPage() {
  // ...tout le code état/handlers...

  // (place ici tout le code d'état, handlers, fetch, etc. de ta version originale...)

  // Render
  return (
    <AdminPageContainer>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/series')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Ajouter une série</h1>
      </div>

      {/* TMDB Search */}
      <form onSubmit={handleTmdbSearch} className="mb-6 w-full max-w-full" role="search" aria-label="Recherche TMDB">
        {/* ...inchangé... */}
      </form>

      <form onSubmit={handleSubmit} className="w-full max-w-full">
        <Tabs defaultValue="general" className="bg-gray-800 rounded-lg shadow-lg">
          {/* ...inchangé... */}
        </Tabs>
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/series')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminPageContainer>
  );
});
                throw error;
              }
              const { data: urlData } = supabase.storage.from('actor-photos').getPublicUrl(data.path);
              photoUrl = urlData?.publicUrl || null;
            }
            return {
              name: member.name,
              role: member.role,
              photo: photoUrl,
            };
          })
      );
      // Upload images
      let posterUrl = '';
      let backdropUrl = '';
      if (posterFile) {
        const { data, error } = await supabase.storage
          .from('series-posters')
          .upload(`posters/${Date.now()}-${posterFile.name}`, posterFile, { cacheControl: '3600', upsert: false });
        if (error) {
          toast({
            title: 'Erreur upload affiche',
            description: error.message || String(error),
            variant: 'destructive',
          });
          throw error;
        }
        const { data: urlData } = supabase.storage.from('series-posters').getPublicUrl(data.path);
        posterUrl = urlData?.publicUrl || '';
      } else if (posterPreview) {
        posterUrl = posterPreview;
      }
      if (backdropFile) {
        const { data, error } = await supabase.storage
          .from('series-backdrops')
          .upload(`backdrops/${Date.now()}-${backdropFile.name}`, backdropFile, { cacheControl: '3600', upsert: false });
        if (error) {
          toast({
            title: 'Erreur upload image de fond',
            description: error.message || String(error),
            variant: 'destructive',
          });
          throw error;
        }
        const { data: urlData } = supabase.storage.from('series-backdrops').getPublicUrl(data.path);
        backdropUrl = urlData?.publicUrl || '';
      } else if (backdropPreview) {
        backdropUrl = backdropPreview;
      }
      // Upload vidéo si nécessaire
      let finalVideoUrl = videoUrl;
      if (videoFile) {
        const { data, error } = await supabase.storage
          .from('series-videos')
          .upload(
            `videos/${Date.now()}-${videoFile.name}`,
            videoFile,
            { cacheControl: '3600', upsert: false }
          );
        if (error) {
          toast({
            title: 'Erreur upload vidéo',
            description: error.message || String(error),
            variant: 'destructive',
          });
          throw error;
        }
        const { data: urlData } = supabase.storage.from('series-videos').getPublicUrl(data.path);
        finalVideoUrl = urlData?.publicUrl || null;
      }
      // Insert series
      const { data: insertData, error: insertError } = await supabase
        .from('series')
        .insert([{
          title,
          original_title: originalTitle || null,
          description,
          start_year: startYear,
          end_year: endYear || null,
          creator: creator || null,
          duration: duration || null,
          genre: selectedGenres.map(
            id => availableGenres.find(g => g.id === id)?.name
          ).filter(Boolean).join(',') || null,
          trailer_url: trailerUrl || null,
          video_url: finalVideoUrl || null,
          isvip: isVIP,
          published: isPublished,
          poster: posterUrl || null,
          backdrop: backdropUrl || null,
          cast: formattedCast,
          homepage_categories: selectedCategories,
        }])
        .select()
        .single();
      if (insertError || !insertData) {
        toast({
          title: 'Erreur',
          description: insertError.message || "Impossible d'ajouter la série.",
          variant: 'destructive',
        });
        throw insertError || new Error("Impossible d'ajouter la série.");
      }
      // Log admin_logs
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('admin_logs').insert([{
            admin_id: user.id,
            action: 'ADD_SERIES',
            details: { series_id: insertData.id, series_title: title },
          }]);
        }
      } catch {}
      toast({
        title: 'Série ajoutée',
        description: `La série "${title}" a été ajoutée avec succès.`,
      });
      router.push(`/admin/series/${insertData.id}/seasons`);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error?.message || String(error) || "Impossible d'ajouter la série.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <AdminPageContainer>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/series')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Ajouter une série</h1>
      </div>

      {/* TMDB Search */}
      <form onSubmit={handleTmdbSearch} className="mb-6 w-full max-w-full" role="search" aria-label="Recherche TMDB">
        {/* ...inchangé... */}
        {/* (garde ici tout le JSX existant du formulaire de recherche TMDB) */}
      </form>

      <form onSubmit={handleSubmit} className="w-full max-w-full">
        <Tabs defaultValue="general" className="bg-gray-800 rounded-lg shadow-lg">
          {/* ...inchangé... */}
          {/* (garde ici tout le JSX des tabs et contenus) */}
        </Tabs>
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/series')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminPageContainer>
  );
}
                  />
                  {posterPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                      }}
                      className="mt-2"
                    >
                      Supprimer l’affiche
                    </Button>
                  )}
                  <p className="text-xs text-gray-400">
                    Format recommandé: 600x900 pixels (ratio 2:3), JPG ou PNG.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backdrop">Image de fond</Label>
                  <div className="mb-2">
                    {backdropPreview && (
                      <img
                        src={backdropPreview}
                        alt="Image de fond sélectionnée"
                        className="rounded shadow h-32 object-cover mb-2"
                        aria-label="Image de fond sélectionnée"
                      />
                    )}
                  </div>
                  <ImageUpload
                    onImageSelected={file => {
                      setBackdropFile(file);
                      setBackdropPreview(URL.createObjectURL(file));
                    }}
                    aspectRatio="16:9"
                    label={backdropPreview ? "Remplacer l'image de fond" : "Ajouter une image de fond"}
                  />
                  {backdropPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBackdropFile(null);
                        setBackdropPreview(null);
                      }}
                      className="mt-2"
                    >
                      Supprimer l’image de fond
                    </Button>
                  )}
                  <p className="text-xs text-gray-400">
                    Format recommandé: 1920x1080 pixels (ratio 16:9), JPG ou PNG.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Vidéo principale (optionnel)</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="URL vidéo externe (YouTube, mp4, etc.)"
                  disabled={!!videoFile}
                />
                <div className="flex flex-col sm:flex-row gap-2 items-center mt-2">
                  <input
                    type="file"
                    accept="video/mp4,video/mkv,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/x-ms-wmv"
                    id="video-upload"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setVideoFile(file);
                        setVideoUrl('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    {videoFile ? "Remplacer la vidéo" : "Uploader une vidéo"}
                  </Button>
                  {videoFile && (
                    <span className="text-sm text-gray-300 ml-2">{videoFile.name}</span>
                  )}
                  {videoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVideoFile(null)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Formats supportés : mp4, mkv, webm, mov, avi, wmv.
                  <br />
                  Si tu uploades une vidéo, l’URL publique sera utilisée dans la fiche de la série.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerUrl">URL de la bande-annonce</Label>
                <Input
                  id="trailerUrl"
                  value={trailerUrl}
                  onChange={e => setTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-400">
                  URL YouTube de la bande-annonce.
                </p>
              </div>
            </div>
          </TabsContent>
          {/* Tab Détails supplémentaires */}
          <TabsContent value="details" className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Casting</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCastMember}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-3">
                  {cast.map((member, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-1">
                        <Input
                          value={member.name}
                          onChange={e => updateCastMember(index, 'name', e.target.value)}
                          placeholder="Nom de l'acteur"
                          className="mb-2"
                        />
                        <Input
                          value={member.role}
                          onChange={e => updateCastMember(index, 'role', e.target.value)}
                          placeholder="Rôle (optionnel)"
                        />
                        <div className="flex items-center mt-2">
                          {member.preview || member.photo ? (
                            <img
                              src={member.preview || member.photo}
                              alt={member.name}
                              className="h-14 w-10 object-cover rounded border mr-3"
                            />
                          ) : (
                            <div className="h-14 w-10 bg-gray-800 rounded border mr-3 flex items-center justify-center">
                              <Tv className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <ImageUpload
                            onImageSelected={file => {
                              if (file) {
                                updateCastPhoto(index, file, URL.createObjectURL(file));
                              }
                            }}
                            aspectRatio="2:3"
                            label={member.preview || member.photo ? "Remplacer la photo" : "Ajouter une photo"}
                          />
                          {(member.preview || member.photo) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCastPhoto(index)}
                              className="ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCastMember(index)}
                        className="mt-2"
                        aria-label="Supprimer cet acteur"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          {/* Tab Catégories d’accueil */}
          <TabsContent value="categories" className="p-6">
            <div className="space-y-4">
              <Label>Catégories d’accueil <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {HOMEPAGE_CATEGORIES.map(category => (
                  <div key={category.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.key}`}
                      checked={selectedCategories.includes(category.key)}
                      onCheckedChange={checked =>
                        setSelectedCategories(checked
                          ? [...selectedCategories, category.key]
                          : selectedCategories.filter(k => k !== category.key)
                        )
                      }
                      aria-checked={selectedCategories.includes(category.key)}
                      aria-label={category.label}
                    />
                    <Label htmlFor={`category-${category.key}`} className="text-sm cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Cochez au moins une catégorie où cette série apparaîtra sur la page d’accueil.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/series')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}