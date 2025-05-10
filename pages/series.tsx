import { useEffect, useState } from 'react'
import { getSeries, addSeries } from '../lib/supabaseSeries'
import SeriesCard from '../components/SeriesCard'
import ImageUpload from '../components/ImageUpload'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function SeriesPage() {
  const [series, setSeries] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()

  useEffect(() => {
    getSeries().then(({ data }) => setSeries(data ?? []))
  }, [])

  const handleAddSeries = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return alert('Connectez-vous pour ajouter une série.')
    setLoading(true)
    const { error } = await addSeries({
      title,
      description,
      created_by: user.id,
      release_date: new Date().toISOString().slice(0, 10),
      image_url: imageUrl
    })
    setLoading(false)
    if (error) alert(error.message)
    else {
      setTitle('')
      setDescription('')
      setImageUrl('')
      getSeries().then(({ data }) => setSeries(data ?? []))
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Ajouter une série</h2>
      <form onSubmit={handleAddSeries}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titre"
          required
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
        />
        <ImageUpload onUpload={url => setImageUrl(url)} />
        {imageUrl && <img src={imageUrl} alt="" style={{ maxWidth: 150, margin: 8 }}/> }
        <button type="submit" disabled={loading || !imageUrl}>Ajouter</button>
      </form>

      <h2>Liste des séries</h2>
      <div>
        {series.map(serie => (
          <SeriesCard
            key={serie.id}
            title={serie.title}
            description={serie.description}
            imageUrl={serie.image_url}
          />
        ))}
      </div>
    </div>
  )
}