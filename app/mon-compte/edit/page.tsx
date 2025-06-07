'use client';

import { useEffect, useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabaseClient';

interface UserProfilePayload {
  displayName: string;
  photoURL: string;
  // email?: string; // Ajoute ce champ si tu veux supporter la modification d'e-mail
}

export default function EditProfilePage() {
  const { userData, isLoggedIn, isLoading, updateProfile } = useSupabaseAuth();
  const router = useRouter();

  // States principaux
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [email, setEmail] = useState('');
  const [initial, setInitial] = useState({ displayName: '', photoURL: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Pour l'accessibilité (focus au chargement)
  const displayNameInputRef = useRef<HTMLInputElement>(null);

  // Chargement initial
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
      setTimeout(() => displayNameInputRef.current?.focus(), 50);
    }
  }, [isLoading, isLoggedIn, userData, router]);

  // Nettoyage de l'URL blob de l'avatarPreview pour éviter fuite mémoire
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Gestion upload avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérif type et taille (max 2Mo)
    if (!/^image\/(jpe?g|png|webp|bmp|gif|svg)$/i.test(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Seules les images (max 2Mo) sont autorisées.');
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    setError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Upload sur Supabase Storage (adapté à ton backend)
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !userData?.id) return null;

    // Log l'ID utilisateur
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log("DEBUG UPLOAD AVATAR - userData.id:", userData.id, "supabase.auth.uid():", authData?.user?.id);

    // Log la session complète (pour JWT/access_token et claims)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("DEBUG SESSION", sessionData?.session);

    const fileExt = avatarFile.name.split('.').pop();

    // Correction : upload sur le NOUVEAU bucket avatars2 à la racine (propre)
    const filePath = `${userData.id}_${Date.now()}.${fileExt}`;

    // Log détaillé avant upload
    console.log("UPLOAD DEBUG", {
      name: avatarFile.name,
      type: avatarFile.type,
      size: avatarFile.size,
      filePath
    });

    // Utilise le NOUVEAU bucket avatars2
    const { data, error } = await supabase.storage.from('avatars2').upload(filePath, avatarFile, { upsert: true });
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return publicUrl?.publicUrl || null;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      let uploadedUrl = photoURL;
      if (avatarFile) {
        uploadedUrl = await uploadAvatar() || photoURL;
        setPhotoURL(uploadedUrl);
      }
      // Appel effectif à updateProfile
      const payload: UserProfilePayload = { displayName, photoURL: uploadedUrl };
      await updateProfile(payload);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/mon-compte');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la mise à jour du profil.");
    }
    setLoading(false);
  };

  // Réinitialisation
  const handleReset = () => {
    setDisplayName(initial.displayName);
    setPhotoURL(initial.photoURL);
    setEmail(initial.email);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    setSuccess(false);
    setTimeout(() => displayNameInputRef.current?.focus(), 50);
  };

  // Suppression avatar (retour à l'avatar par défaut)
  const handleRemoveAvatar = () => {
    setPhotoURL('');
    setAvatarFile(null);
    setAvatarPreview(null);
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
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || photoURL} alt={displayName || 'Utilisateur'} />
                <AvatarFallback className="bg-gray-900 text-2xl">
                  {displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2 items-center mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                  aria-label="Uploader une photo"
                  className="!w-44"
                />
                {(photoURL || avatarPreview) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    aria-label="Supprimer la photo de profil"
                    className="text-xs"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
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
                ref={displayNameInputRef}
                autoFocus
              />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="email">Adresse e-mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                // onChange={e => setEmail(e.target.value)}
                disabled={true} // Désactivé tant que la logique updateEmail n'est pas finalisée
                aria-label="Adresse e-mail"
              />
              <div className="text-xs text-gray-400 mt-1">Modification d’email bientôt disponible.</div>
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
            <div aria-live="polite">
              {success && (
                <div className="text-green-500 text-sm mt-2">Profil mis à jour avec succès !</div>
              )}
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}