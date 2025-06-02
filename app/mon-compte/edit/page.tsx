'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
// import { supabase } from '@/lib/supabaseClient'; // décommentez si vous avez un client supabase

export default function EditProfilePage() {
  // Vérification : updateProfile est bien récupéré du hook
  const { userData, isLoggedIn, isLoading, updateProfile } = useSupabaseAuth();
  // TODO: Ajoutez updateProfile et updateEmail dans le hook useSupabaseAuth si nécessaire
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [email, setEmail] = useState('');
  const [initial, setInitial] = useState({ displayName: '', photoURL: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login?redirect=/mon-compte/edit');
    }
    if (userData) {
      setDisplayName(userData.displayName || '');
      setPhotoURL(userData.photoURL || '');
      setEmail(userData.email || '');
      setInitial({
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        email: userData.email || '',
      });
    }
  }, [isLoading, isLoggedIn, userData, router]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    // Optionnel : upload immédiat ici, ou lors du submit
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;
    // Exemple d'upload Supabase Storage (adaptez selon votre backend)
    // const fileExt = avatarFile.name.split('.').pop();
    // const filePath = `avatars/${userData.id}_${Date.now()}.${fileExt}`;
    // const { data, error } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
    // if (error) throw error;
    // const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
    // return publicUrl?.publicUrl || null;
    // Pour la démo, on retourne null (pas d'upload effectif)
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      let uploadedUrl = photoURL;
      if (avatarFile) {
        const url = await uploadAvatar();
        if (url) uploadedUrl = url;
        setPhotoURL(uploadedUrl);
      }
      // Appel effectif à updateProfile pour mettre à jour la base ET le contexte utilisateur
      await updateProfile({ displayName, photoURL: uploadedUrl });
      // if (email !== initial.email && updateEmail) {
      //   await updateEmail(email);
      // }
      setSuccess(true);
      setTimeout(() => {
        router.replace('/mon-compte');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la mise à jour du profil.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setDisplayName(initial.displayName);
    setPhotoURL(initial.photoURL);
    setEmail(initial.email);
    setError(null);
    setSuccess(false);
  };

  if (isLoading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-gray-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Modifier mon profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || photoURL} alt={displayName || 'Utilisateur'} />
                <AvatarFallback className="bg-gray-900 text-2xl">
                  {displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={handleAvatarChange}
                disabled={loading}
                aria-label="Uploader une photo"
              />
              <Input
                type="url"
                placeholder="URL de la photo de profil"
                value={photoURL}
                onChange={e => setPhotoURL(e.target.value)}
                className="mt-2"
                disabled={loading}
                aria-label="URL de la photo de profil"
              />
              {avatarPreview && (
                <div className="text-xs text-gray-400">Aperçu de la nouvelle photo</div>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="displayName">Nom affiché</label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                disabled={loading}
                aria-label="Nom affiché"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="email">Adresse e-mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-label="Adresse e-mail"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/mon-compte')} disabled={loading}>
                Annuler
              </Button>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={loading}>
                Réinitialiser
              </Button>
            </div>
            {success && (
              <div className="text-green-500 text-sm mt-2">Profil mis à jour avec succès !</div>
            )}
            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
