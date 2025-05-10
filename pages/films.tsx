import { useEffect, useState } from 'react'
import { getFilms, addFilm } from '../lib/supabaseFilms'
import FilmCard from '../components/FilmCard'
import ImageUpload from '../components/ImageUpload'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function FilmsPage() {
  const [films, setFilms] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()

  // Charger la liste des films
  useEffect(() => {
    getFilms().then(({ data }) => setFilms(data ?? []))
  }, [])

  // Ajout d’un film avec image
  const handleAddFilm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return alert('Connectez-vous pour ajouter un film.')
    setLoading(true)
    const { error } = await addFilm({
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
      getFilms().then(({ data }) => setFilms(data ?? []))
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Ajouter un film</h2>
      <form onSubmit={handleAddFilm}>
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

      <h2>Liste des films</h2>
      <div>
        {films.map(film => (
          <FilmCard
            key={film.id}
            title={film.title}
            description={film.description}
            imageUrl={film.image_url}
          />
        ))}
      </div>
    </div>
  )
}