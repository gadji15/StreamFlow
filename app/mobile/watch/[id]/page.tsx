"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, Download, Lock, Wifi, Share2 } from "lucide-react"
import { motion } from "framer-motion"

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
    description:
      "Paul Atreides, un jeune homme brillant et doué, né pour connaître un destin plus grand que lui-même, doit se rendre sur la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de son peuple.",
    year: 2021,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Jason Momoa", "Zendaya"],
    genres: ["Science-Fiction", "Aventure", "Drame"],
  }
}

export default function MobileVideoPlayerPage({ params }: { params: { id: string } }) {
  const videoData = getVideoData(params.id)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoaded(true)
    }

    const handleEnded = () => {
      setIsPlaying(false)
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

  const handleVideoTap = () => {
    setShowControls(!showControls)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    return [h > 0 ? h : null, h > 0 ? (m < 10 ? `0${m}` : m) : m, s < 10 ? `0${s}` : s].filter(Boolean).join(":")
  }

  const downloadOptions = [
    { quality: "HD (1080p)", size: "4.2 GB" },
    { quality: "SD (720p)", size: "2.1 GB" },
    { quality: "Basse (480p)", size: "1.2 GB" },
  ]

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Video Player */}
      <div
        id="video-container"
        className="relative flex-1 flex items-center justify-center bg-black"
        onClick={handleVideoTap}
      >
        <video
          ref={videoRef}
          src={videoData.src}
          poster={videoData.thumbnail}
          className="w-full h-full max-h-screen object-contain"
          playsInline
          preload="metadata"
        ></video>

        {/* Video Controls */}
        {showControls && (
          <div
            className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-black/30 to-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-white bg-black/50 rounded-full hover:bg-black/70"
              >
                <Link href="/mobile">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-black/50 rounded-full hover:bg-black/70"
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white bg-black/50 rounded-full hover:bg-black/70">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Middle Play Button */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-16 w-16 text-white bg-black/50 rounded-full hover:bg-black/70"
                disabled={!isLoaded}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-3">
              {/* Progress Bar */}
              <div ref={progressRef} className="video-progress cursor-pointer" onClick={handleProgressClick}>
                <div className="video-progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Play/Pause Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="video-button"
                    disabled={!isLoaded}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  {/* Time Display */}
                  <div className="video-time text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Mute Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="video-button"
                    disabled={!isLoaded}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  {/* Fullscreen Button */}
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="video-button">
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Options Modal */}
        {showDownloadOptions && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-xl p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Télécharger</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowDownloadOptions(false)}
              >
                <ArrowLeft className="h-5 w-5 rotate-90" />
              </Button>
            </div>

            <div className="space-y-3 mb-4">
              {downloadOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{option.quality}</p>
                    <p className="text-gray-400 text-sm">{option.size}</p>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Wifi className="h-4 w-4" />
              <p>Téléchargement uniquement en Wi-Fi</p>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm mt-2">
              <Lock className="h-4 w-4" />
              <p>Disponible hors ligne pendant 30 jours</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Info Section */}
      <div className="bg-gray-950 p-4">
        <h1 className="text-xl font-bold text-white mb-1">{videoData.title}</h1>
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <span>{videoData.year}</span>
          <span className="mx-2">•</span>
          <span>{formatTime(duration)}</span>
        </div>

        <Button
          variant="ghost"
          className="w-full flex items-center justify-between py-2 px-0 text-left"
          onClick={() => setShowInfo(!showInfo)}
        >
          <span className="text-white font-medium">Plus d'informations</span>
          <ArrowLeft
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showInfo ? "rotate-90" : "-rotate-90"}`}
          />
        </Button>

        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 space-y-3"
          >
            <p className="text-gray-300 text-sm">{videoData.description}</p>

            <div>
              <p className="text-gray-400 text-sm">
                Réalisateur: <span className="text-white">{videoData.director}</span>
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Casting:</p>
              <div className="flex flex-wrap gap-2">
                {videoData.cast.map((actor, index) => (
                  <span key={index} className="text-white text-sm bg-gray-800 px-2 py-1 rounded-full">
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Genres:</p>
              <div className="flex flex-wrap gap-2">
                {videoData.genres.map((genre, index) => (
                  <span key={index} className="text-white text-sm bg-gray-800 px-2 py-1 rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
