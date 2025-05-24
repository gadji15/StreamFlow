"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface NextEpisodeProps {
  title: string
  onPlay: () => void
}

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  onEnded?: () => void
  nextEpisode?: NextEpisodeProps
  onClose?: () => void
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  onEnded,
  nextEpisode,
  onClose,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

  // State
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [playPauseIcon, setPlayPauseIcon] = useState<"play" | "pause" | null>(null)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [cinemaMode, setCinemaMode] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [subtitles, setSubtitles] = useState<{label: string, src: string, lang: string}[]>([])
  const [activeSubtitle, setActiveSubtitle] = useState<string|null>(null)
  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Utils
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setPlayPauseIcon("pause")
      } else {
        videoRef.current.play()
        setPlayPauseIcon("play")
      }
      setIsPlaying(!isPlaying)
      setTimeout(() => setPlayPauseIcon(null), 600)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      if (nextEpisode && videoRef.current.duration - videoRef.current.currentTime < 10) {
        setShowNextEpisode(true)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      videoRef.current.playbackRate = playbackRate
    }
  }

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

  const handleSeek = (values: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = values[0]
      setCurrentTime(values[0])
    }
  }

  const handleVolumeChange = (values: number[]) => {
    if (videoRef.current) {
      const newVolume = values[0]
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

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

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen?.().then(() => {
          setIsFullscreen(true)
        }).catch(() => {})
      } else {
        document.exitFullscreen?.().then(() => {
          setIsFullscreen(false)
        }).catch(() => {})
      }
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
    }
  }

  // Show/hide controls on mouse or touch
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isMobile) setShowControls(false)
    }, 2500)
  }

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault(); togglePlay(); break
        case "f":
          toggleFullscreen(); break
        case "t":
          setCinemaMode((v) => !v); break
        case "p":
          handlePiP(); break
        case "c":
          setShowSubMenu((v) => !v); break
        case "m":
          toggleMute(); break
        case "arrowright":
          skipForward(); break
        case "arrowleft":
          skipBackward(); break
        case "+":
        case "=":
        case ">":
          setPlaybackRate(r => {
            const next = Math.min(2, parseFloat((r + 0.25).toFixed(2)))
            if (videoRef.current) videoRef.current.playbackRate = next
            return next
          });
          break
        case "-":
        case "_":
        case "<":
          setPlaybackRate(r => {
            const next = Math.max(0.5, parseFloat((r - 0.25).toFixed(2)))
            if (videoRef.current) videoRef.current.playbackRate = next
            return next
          });
          break
      }
      setShowControls(true)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, isMuted, duration, playbackRate])

  // Touch controls for mobile
  const handleTouch = () => {
    setShowControls(v => !v)
  }

  // Mode Picture-in-Picture
  const handlePiP = async () => {
    if (videoRef.current) {
      if (!document.pictureInPictureElement) {
        try {
          // @ts-ignore
          await videoRef.current.requestPictureInPicture()
          setIsPiP(true)
        } catch {}
      } else {
        // @ts-ignore
        await document.exitPictureInPicture?.()
        setIsPiP(false)
      }
    }
  }

  // --- Subcomponents ---
  const ControlButton = ({
    onClick, ariaLabel, children, className, ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { ariaLabel: string }) => (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      size="icon"
      variant="ghost"
      className={cn("rounded-full p-2 transition", className)}
      {...props}
    >
      {children}
    </Button>
  )

  // --- Responsive Layout ---
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black overflow-hidden flex flex-col justify-center items-center",
        "aspect-video md:rounded-xl shadow-lg",
        "max-h-screen",
        cinemaMode && "fixed inset-0 z-[9999] bg-black transition-all duration-300",
      )}
      onMouseMove={!isMobile ? showControlsTemporarily : undefined}
      onTouchStart={isMobile ? handleTouch : undefined}
      tabIndex={0}
      style={{ touchAction: "manipulation" }}
    >
    {cinemaMode && (
      <div className="fixed inset-0 bg-black/90 z-[9998]" aria-hidden="true"></div>
    )}
      {/* Close button */}
      {onClose && showControls && (
        <ControlButton
          ariaLabel="Fermer le lecteur"
          onClick={e => { e.stopPropagation(); onClose(); }}
          className="absolute top-2 right-2 z-30 bg-black/80 hover:bg-black/90"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ControlButton>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={cn(
          "w-full h-full object-contain",
          isMobile ? "rounded-none" : "rounded-xl"
        )}
        autoPlay={autoPlay}
        onClick={e => { e.stopPropagation(); togglePlay(); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onPlay={() => { setIsPlaying(true); setPlayPauseIcon("play"); setTimeout(() => setPlayPauseIcon(null), 600); }}
        onPause={() => { setIsPlaying(false); setPlayPauseIcon("pause"); setTimeout(() => setPlayPauseIcon(null), 600); }}
        onEnded={() => {
          setIsPlaying(false)
          if (onEnded) onEnded()
        }}
        tabIndex={-1}
        controls={false}
        playsInline
        preload="metadata"
      />
      {/* Icône centrale play/pause animée */}
      {playPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-fade">
          <div className="bg-black/60 rounded-full p-6 sm:p-8 flex items-center justify-center">
            {playPauseIcon === "play" ? (
              <Play size={64} className="text-white drop-shadow" />
            ) : (
              <Pause size={64} className="text-white drop-shadow" />
            )}
          </div>
        </div>
      )}

      {/* Overlay: Title */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none select-none">
          <h2 className="text-white font-semibold text-base sm:text-lg md:text-xl truncate">{title}</h2>
        </div>
      )}

      {/* Barre de progression (une seule ligne, Slider/seekbar) */}
      <div className="absolute bottom-[64px] left-0 w-full z-20 px-2 md:px-6 flex flex-col gap-0.5">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
          aria-label="Barre de progression"
        />
        <div className="flex justify-between items-center text-xs text-gray-300 font-mono w-full">
          <span>{formatTime(currentTime)}</span>
          {/* Contrôle vitesse */}
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs px-2 py-1"
              onClick={() => setShowSpeedMenu(v => !v)}
              aria-label="Vitesse de lecture"
              tabIndex={0}
            >
              {playbackRate}x
            </Button>
            {showSpeedMenu && (
              <div className="absolute bottom-8 right-0 bg-black/95 rounded shadow-lg z-50 flex flex-col py-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => {
                      setShowSpeedMenu(false)
                      setPlaybackRate(speed)
                      if (videoRef.current) videoRef.current.playbackRate = speed
                    }}
                    className={`px-4 py-1 text-left hover:bg-primary/30 text-xs ${playbackRate===speed?"bg-primary/30 text-primary font-bold": "text-white"}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-30",
            "bg-gradient-to-t from-black/80 to-transparent px-2 py-2 md:px-6 md:py-4",
            "flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0"
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Main controls */}
          <div className="flex items-center gap-2 md:gap-4 justify-center">
            <ControlButton
              onClick={togglePlay}
              ariaLabel={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </ControlButton>
            <ControlButton
              onClick={skipBackward}
              ariaLabel="Reculer de 10 secondes"
            >
              <SkipBack size={20} />
            </ControlButton>
            <ControlButton
              onClick={skipForward}
              ariaLabel="Avancer de 10 secondes"
            >
              <SkipForward size={20} />
            </ControlButton>
          </div>
          {/* Volume & fullscreen, cinema, PiP, sous-titres */}
          <div className="flex items-center gap-2 md:gap-4 justify-center">
            <ControlButton
              onClick={toggleMute}
              ariaLabel={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </ControlButton>
            <div className="w-20 md:w-36">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                aria-label="Volume"
              />
            </div>
            <ControlButton
              onClick={toggleFullscreen}
              ariaLabel={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </ControlButton>
            {/* Cinema mode */}
            <ControlButton
              onClick={() => setCinemaMode(v => !v)}
              ariaLabel={cinemaMode ? "Quitter le mode cinéma" : "Mode cinéma"}
            >
              <svg width={22} height={22} fill="none" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="10" rx="2" stroke="white" strokeWidth="2" />
                <rect x="7" y="11" width="2" height="2" fill="white" />
                <rect x="15" y="11" width="2" height="2" fill="white" />
              </svg>
            </ControlButton>
            {/* PiP */}
            <ControlButton
              onClick={handlePiP}
              ariaLabel={isPiP ? "Fermer le mode Picture-in-Picture" : "Picture-in-Picture"}
            >
              <svg width={22} height={22} fill="none" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="2"/>
                <rect x="15" y="13" width="4" height="4" rx="1" fill="white"/>
              </svg>
            </ControlButton>
            {/* Sous-titres */}
            <ControlButton
              onClick={() => setShowSubMenu(v => !v)}
              ariaLabel="Sous-titres"
            >
              <svg width={22} height={22} fill="none" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="10" rx="2" stroke="white" strokeWidth="2"/>
                <rect x="7" y="11" width="2" height="2" fill="white"/>
                <rect x="15" y="11" width="2" height="2" fill="white"/>
              </svg>
            </ControlButton>
            {showSubMenu && (
              <div className="absolute bottom-12 right-0 bg-black/95 rounded shadow-lg z-50 flex flex-col py-1 min-w-[120px]">
                <button
                  className={`px-4 py-1 text-left hover:bg-primary/30 text-xs ${!activeSubtitle?"bg-primary/30 text-primary font-bold": "text-white"}`}
                  onClick={() => { setActiveSubtitle(null); setShowSubMenu(false); }}
                >
                  Désactiver
                </button>
                {subtitles.map(sub => (
                  <button
                    key={sub.lang}
                    className={`px-4 py-1 text-left hover:bg-primary/30 text-xs ${activeSubtitle===sub.lang?"bg-primary/30 text-primary font-bold": "text-white"}`}
                    onClick={() => { setActiveSubtitle(sub.lang); setShowSubMenu(false); }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next episode (always accessible on mobile, hover on desktop) */}
      {showNextEpisode && nextEpisode && (
        <Sheet open={showNextEpisode} onOpenChange={setShowNextEpisode}>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={cn(
              "bg-black/90 p-4 rounded-t-xl md:rounded-l-xl flex flex-col items-center gap-2",
              "w-full max-w-xs md:max-w-sm"
            )}
          >
            <div className="text-white text-sm mb-2 text-center">
              Épisode suivant : <span className="font-semibold">{nextEpisode.title}</span>
            </div>
            <Button
              onClick={nextEpisode.onPlay}
              className="bg-primary text-white w-full py-2 px-4 rounded-md hover:bg-primary/90"
              aria-label="Regarder l'épisode suivant"
            >
              Regarder
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowNextEpisode(false)}
              className="text-gray-400 hover:text-white mt-1"
            >
              Fermer
            </Button>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}