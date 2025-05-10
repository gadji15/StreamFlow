/**
 * Affiche une image stockée sur Supabase Storage.
 * @param url URL publique de l’image
 * @param alt Texte alternatif
 */
export default function SupaImage({ url, alt }: { url: string, alt?: string }) {
  if (!url) return <span>Pas d&apos;image</span>
  return <img src={url} alt={alt ?? ''} style={{ maxWidth: '100%', borderRadius: 8 }} />
}