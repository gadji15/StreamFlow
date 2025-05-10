import { useState } from 'react'

/**
 * Permet l’upload d’une image via l’API Next.js (Supabase Storage) et retourne l’URL publique.
 */
export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setUploading(false)

    if (!res.ok || !data.url) {
      setError(data?.error ?? 'Erreur upload')
    } else {
      onUpload(data.url)
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