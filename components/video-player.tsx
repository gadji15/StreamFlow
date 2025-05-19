"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  onEnded?: () => void
  onClose?: () => void
  nextEpisode?: {
    title: string
    onPlay: () => void
  }
}

export function VideoPlayer({ 
  src, 
  poster, 
  title,
  autoPlay = false,
  onEnded,
  nextEpisode
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  
  // Définir un délai pour masquer les contrôles
  let hideControlsTimeout: NodeJS.Timeout
  
  // Gérer l'état de lecture
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  // Mettre à jour le temps actuel
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      
      // Afficher le bouton pour l'épisode suivant quand on approche de la fin
      if (nextEpisode && videoRef.current.duration - videoRef.current.currentTime < 10) {
        setShowNextEpisode(true)
      }
    }
  }
  
  // Définir la durée quand les métadonnées sont chargées
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }
  
  // Mettre à jour la progression du chargement
  const handleProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const progress = (bufferedEnd / video.duration) * 100
        setLoadingProgress(progress)
      }
    }
  }
  
  // Gérer le changement de position dans la vidéo
  const handleSeek = (values: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = values[0]
      setCurrentTime(values[0])
    }
  }
  
  // Gérer le changement de volume
  const handleVolumeChange = (values: number[]) => {
    if (videoRef.current) {
      const newVolume = values[0]
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }
  
  // Gérer le mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }
  
  // Gérer le plein écran
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true)
        }).catch(err => {
          console.error('Erreur de passage en plein écran:', err)
        })
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        }).catch(err => {
          console.error('Erreur de sortie du plein écran:', err)
        })
      }
    }
  }
  
  // Formater le temps (secondes -> MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }
  
  // Reculer de 10 secondes
  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }
  
  // Avancer de 10 secondes
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
    }
  }
  
  // Afficher/masquer les contrôles
  const handleMouseMove = () => {
    setShowControls(true)
    clearTimeout(hideControlsTimeout)
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }
  
  // Nettoyer le timeout quand le composant est démonté
  useEffect(() => {
    return () => {
      clearTimeout(hideControlsTimeout)
    }
  }, [])
  
  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          togglePlay()
          break
        case 'f':
          toggleFullscreen()
          break
        case 'm':
          toggleMute()
          break
        case 'arrowright':
          skipForward()
          break
        case 'arrowleft':
          skipBackward()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPlaying, isMuted, duration])
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black"
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      {/* Close button (top-right) */}
      {onClose && (
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-20 bg-black/70 rounded-full p-2 hover:bg-black/90 transition"
          aria-label="Fermer le lecteur"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        autoPlay={autoPlay}
        onClick={e => e.stopPropagation()}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          if (onEnded) onEnded()
        }}
      />
      
      {/* Barre de chargement */}
      <div className="absolute bottom-[48px] left-0 w-full h-1 bg-gray-800">
        <div 
          className="h-full bg-gray-600" 
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      {/* Contrôles */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <h2 className="text-white font-medium">{title}</h2>
          </div>
        )}
        
        {/* Barre de progression */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Boutons de contrôle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button 
              onClick={skipBackward}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={skipForward}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <SkipForward size={20} />
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Bouton épisode suivant */}
      {showNextEpisode && nextEpisode && (
        <div className="absolute bottom-[70px] right-4 bg-black/80 p-2 rounded-md transition-opacity duration-300">
          <p className="text-white text-sm mb-1">Épisode suivant: {nextEpisode.title}</p>
          <button 
            onClick={nextEpisode.onPlay}
            className="bg-primary text-white text-sm py-1 px-3 rounded-md w-full hover:bg-primary/90"
          >
            Regarder
          </button>
        </div>
      )}
    </div>
  )
}