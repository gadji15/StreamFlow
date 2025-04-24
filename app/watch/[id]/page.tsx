"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Settings, ArrowLeft } from "lucide-react"

// Mock data for video
const getVideoData = (id: string) => {
  return {
    id: Number.parseInt(id),
    title: "Dune",
    src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", // Sample video URL
    thumbnail: "/placeholder.svg?height=1080&width=1920",
    duration: 596, // in seconds
    nextEpisode: {
      id: 2,
      title: "Episode 2",
    },
  }
}

export default function VideoPlayerPage({ params }: { params: { id: string } }) {
  const videoData = getVideoData(params.id)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showNextEpisode, setShowNextEpisode] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Show next episode button when near the end
      if (video.duration - video.currentTime < 30) {
        setShowNextEpisode(true)
      } else {
        setShowNextEpisode(false)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoaded(true)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setShowNextEpisode(true)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

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
  }, [])

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

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    return [h > 0 ? h : null, h > 0 ? (m < 10 ? `0${m}` : m) : m, s < 10 ? `0${s}` : s].filter(Boolean).join(":")
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Back Button */}
      <div className="p-4 absolute top-0 left-0 z-20">
        <Button variant="ghost" size="icon" asChild className="text-white bg-black/50 rounded-full hover:bg-black/70">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Video Player */}
      <div
        id="video-container"
        className="relative flex-1 flex items-center justify-center bg-black"
        onMouseMove={handleMouseMove}
        onClick={() => isLoaded && togglePlay()}
      >
        <video
          ref={videoRef}
          src={videoData.src}
          poster={videoData.thumbnail}
          className="w-full h-full max-h-screen object-contain"
          preload="metadata"
        ></video>

        {/* Video Controls */}
        {showControls && (
          <div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div ref={progressRef} className="video-progress mb-4 cursor-pointer" onClick={handleProgressClick}>
              <div className="video-progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause Button */}
                <Button variant="ghost" size="icon" onClick={togglePlay} className="video-button" disabled={!isLoaded}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>

                {/* Skip Backward */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skip(-10)}
                  className="video-button"
                  disabled={!isLoaded}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                {/* Skip Forward */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skip(10)}
                  className="video-button"
                  disabled={!isLoaded}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="video-button"
                    disabled={!isLoaded}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-purple-500"
                  />
                </div>

                {/* Time Display */}
                <div className="video-time">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Settings Button */}
                <Button variant="ghost" size="icon" className="video-button">
                  <Settings className="h-5 w-5" />
                </Button>

                {/* Fullscreen Button */}
                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="video-button">
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Next Episode Overlay */}
        {showNextEpisode && (
          <div className="absolute bottom-20 right-4 bg-gray-900/90 p-4 rounded-lg shadow-lg">
            <p className="text-white font-medium mb-2">Prochain épisode</p>
            <p className="text-gray-300 text-sm mb-3">{videoData.nextEpisode.title}</p>
            <Button asChild className="btn-primary w-full">
              <Link href={`/watch/${videoData.nextEpisode.id}`}>Regarder</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
