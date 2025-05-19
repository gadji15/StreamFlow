"use client";

import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { Maximize, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  canWatch?: boolean;
  fallbackMessage?: string;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  canWatch = true,
  fallbackMessage = "Vous n'avez pas accès à ce contenu.",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS.js if needed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setIsLoaded(true));
    } else {
      video.onloadedmetadata = () => setIsLoaded(true);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canWatch) return;
      switch (e.key) {
        case " ":
          togglePlay();
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const togglePlay = () => {
    if (!canWatch) return;
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = Number.parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error enabling full-screen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h > 0 ? h : null, h > 0 ? (m < 10 ? `0${m}` : m) : m, s < 10 ? `0${s}` : s].filter(Boolean).join(":");
  };

  return (
    <div
      id="video-container"
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg"
      onMouseMove={handleMouseMove}
      onClick={() => isLoaded && canWatch && togglePlay()}
    >
      {!canWatch ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <span className="text-xl text-red-400 font-semibold">{fallbackMessage}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={!src.endsWith(".m3u8") ? src : undefined}
          poster={poster}
          className="w-full h-full object-contain"
          preload="metadata"
          controls={false}
          muted={isMuted}
        ></video>
      )}

      {showControls && canWatch && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20" onClick={e => e.stopPropagation()}>
          {/* ProgressBar */}
          <div className="mb-4 cursor-pointer relative h-2 rounded-lg bg-gray-700">
            <div
              className="absolute top-0 left-0 h-2 bg-purple-500 rounded-lg"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={togglePlay} disabled={!isLoaded}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => skip(-10)} disabled={!isLoaded}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => skip(10)} disabled={!isLoaded}>
                <SkipForward className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMute} disabled={!isLoaded}>
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
              <div>
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                <Maximize className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}