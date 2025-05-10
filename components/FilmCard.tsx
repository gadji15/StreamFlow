import SupaImage from './SupaImage'

/**
 * Exemple de fiche film utilisant Supabase Storage pour l’affiche.
 */
export default function FilmCard({ title, description, imageUrl }: { title: string, description: string, imageUrl: string }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
      <SupaImage url={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}