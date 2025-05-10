import { useState } from 'react'
import { uploadToStorage, deleteFromStorage } from '../lib/supabaseStorage'

/**
 * Permet l’upload d’une image sur Supabase Storage et retourne l’URL publique.
 * Nécessite un bucket nommé 'images' sur Supabase Storage.
 */
export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    // Génère un chemin unique (par exemple: `${Date.now()}-${file.name}`)
    const path = `${Date.now()}-${file.name}`

    const { publicUrl, error } = await uploadToStorage('images', path, file)
    setUploading(false)
    if (error || !publicUrl) {
      setError(error?.message ?? 'Erreur upload')
    } else {
      onUpload(publicUrl)
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Envoi en cours...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}