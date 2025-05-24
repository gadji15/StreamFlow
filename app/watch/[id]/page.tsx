"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Settings, ArrowLeft } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"

// Helper : charge un film par id depuis Supabase
async function fetchFilmById(id: string) {
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export default function VideoPlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [film, setFilm] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  // (Suppression de toute la logique player custom, on utilise VideoPlayer)

  // --- FETCH FILM ---
  useEffect(() => {
    setLoading(true)
    setFilm(null)
    setError(null)
    fetchFilmById(params.id)
      .then(film => {
        if (!film) throw new Error("Film non trouvé")
        if (!film.video_url) throw new Error("Aucune vidéo disponible pour ce film.")
        setFilm(film)
      })
      .catch(e => setError(typeof e === "string" ? e : e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  // --- PLAYER LOGIC (dynamique sur video_url) ---
  useEffect(() => {
    if (!film) return
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoaded(true)
    }
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [film])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          togglePlay()
          break
        case "ArrowRight":
          skip(10)
          break
        case "ArrowLeft":
          skip(-10)
          break
        case "m":
          toggleMute()
          break
        case "f":
          toggleFullscreen()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line
  }, [isPlaying, isMuted])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const newVolume = Number.parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime += seconds
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current
    const video = videoRef.current
    if (!progressBar || !video) return
    const rect = progressBar.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * video.duration
  }

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container")
    if (!videoContainer) return

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return [h > 0 ? h : null, h > 0 ? (m < 10 ? `0${m}` : m) : m, s < 10 ? `0${s}` : s].filter(Boolean).join(":")
  }

  // --- RENDU ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Chargement du film...
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-400">
        {error}
      </div>
    )
  }
  if (!film) return null

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Back Button */}
      <div className="p-4 absolute top-0 left-0 z-20">
        <Button variant="ghost" size="icon" asChild className="text-white bg-black/50 rounded-full hover:bg-black/70">
          <Link href={`/films/${film.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Titre du film */}
      <div className="text-white text-xl font-bold pt-8 px-6 pb-2">{film.title}</div>

      {/* Video Player premium */}
      <div
        id="video-container"
        className="relative flex-1 flex items-center justify-center bg-black"
        style={{ minHeight: 400 }}
      >
        <VideoPlayer
          src={film.video_url}
          poster={film.poster || film.thumbnail || "/placeholder.svg"}
          title={film.title}
          autoPlay
        />
      </div>
      {/* Optionnel : description, suggestions, etc. */}
      {film.description && (
        <div className="text-white/80 text-sm px-6 pb-6 pt-2 max-w-2xl">{film.description}</div>
      )}
    </div>
  )
}
function setIsFullscreen(arg0: boolean) {
  throw new Error("Function not implemented.")
}

