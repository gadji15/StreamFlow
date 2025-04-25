"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ArrowLeftCircle,
  Subtitles,
  RotateCcw,
  Volume1,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onClose?: () => void;
  autoPlay?: boolean;
  nextEpisode?: {
    id: string;
    title: string;
    thumbnail: string;
  };
}

export function VideoPlayer({
  src,
  title,
  poster,
  onClose,
  autoPlay = false,
  nextEpisode,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [subtitles, setSubtitles] = useState(false);
  
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Show next episode card when approaching the end
      if (nextEpisode && video.duration > 0 && (video.duration - video.currentTime) < 20) {
        setShowNextEpisode(true);
      } else {
        setShowNextEpisode(false);
      }
    };
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    
    // Add event listeners
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    
    // Clean up
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [nextEpisode]);
  
  // Auto-hide controls after inactivity
  useEffect(() => {
    const startHideControlsTimer = () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      
      hideControlsTimerRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    if (isPlaying) {
      startHideControlsTimer();
    }
    
    // Clean up
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [isPlaying, showControls]);
  
  // Auto-hide volume slider
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showVolumeSlider) {
      timer = setTimeout(() => {
        setShowVolumeSlider(false);
      }, 2000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showVolumeSlider]);
  
  // Autoplay
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Autoplay failed:", error);
      });
    }
  }, [autoPlay]);
  
  // Playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  
  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      setVolume(newVolume);
    }
  };
  
  // Handle seek
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Handle skip forward/backward
  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
  
  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black aspect-video overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
      />
      
      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Next Episode Card */}
      <AnimatePresence>
        {showNextEpisode && nextEpisode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-8 bg-surface border border-gray-800 rounded-lg shadow-xl overflow-hidden max-w-xs z-20"
          >
            <div className="p-3 border-b border-gray-800">
              <h3 className="font-semibold text-sm">Épisode suivant</h3>
            </div>
            <div className="flex items-center p-3">
              <div className="w-24 h-16 relative flex-shrink-0 mr-3">
                <img
                  src={nextEpisode.thumbnail}
                  alt={nextEpisode.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-2">{nextEpisode.title}</h4>
              </div>
            </div>
            <div className="flex p-2 border-t border-gray-800">
              <button className="flex-1 text-center py-1 text-sm font-medium hover:bg-surface-light rounded">
                Annuler
              </button>
              <div className="w-px bg-gray-800"></div>
              <button className="flex-1 text-center py-1 text-sm font-medium text-primary hover:bg-surface-light rounded">
                Lire
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Video Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between z-10 bg-gradient-to-b from-black/60 via-transparent to-black/60 p-4"
          >
            {/* Top Controls */}
            <div className="flex justify-between items-center">
              {/* Back Button & Title */}
              <div className="flex items-center">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-white/90 hover:text-white mr-4"
                    aria-label="Back"
                  >
                    <ArrowLeftCircle size={24} />
                  </button>
                )}
                {title && <h2 className="text-lg font-medium">{title}</h2>}
              </div>
              
              {/* Settings Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white/90 hover:text-white"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>
                
                {/* Settings Menu */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-surface border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                    >
                      {/* Playback Speed */}
                      <div className="p-3 border-b border-gray-800">
                        <h3 className="text-sm font-medium mb-2">Vitesse de lecture</h3>
                        <div className="flex flex-wrap gap-2">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              className={`px-2 py-1 text-xs rounded ${
                                playbackSpeed === speed
                                  ? "bg-primary text-white"
                                  : "bg-surface-light hover:bg-gray-700"
                              }`}
                              onClick={() => setPlaybackSpeed(speed)}
                            >
                              {speed === 1 ? "Normal" : `${speed}x`}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quality */}
                      <div className="p-3 border-b border-gray-800">
                        <h3 className="text-sm font-medium mb-2">Qualité</h3>
                        <div className="flex flex-wrap gap-2">
                          {["auto", "1080p", "720p", "480p", "360p"].map((q) => (
                            <button
                              key={q}
                              className={`px-2 py-1 text-xs rounded ${
                                quality === q
                                  ? "bg-primary text-white"
                                  : "bg-surface-light hover:bg-gray-700"
                              }`}
                              onClick={() => setQuality(q)}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Subtitles */}
                      <div className="p-3">
                        <button
                          className="flex items-center justify-between w-full"
                          onClick={() => setSubtitles(!subtitles)}
                        >
                          <div className="flex items-center">
                            <Subtitles size={16} className="mr-2" />
                            <span className="text-sm">Sous-titres</span>
                          </div>
                          <div className={`w-8 h-4 rounded-full relative ${
                            subtitles ? "bg-primary" : "bg-gray-600"
                          }`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transform transition-all ${
                              subtitles ? "left-[calc(100%-14px)]" : "left-0.5"
                            }`}></div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Middle Play/Pause */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={togglePlay}
                className="bg-white/20 hover:bg-white/30 rounded-full p-6 backdrop-blur-sm transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={30} className="text-white" />
                ) : (
                  <Play size={30} className="text-white" />
                )}
              </button>
            </div>
            
            {/* Bottom Controls */}
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="w-full">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
              </div>
              
              <div className="flex justify-between items-center">
                {/* Left Controls (Play/Pause, Time, Skip) */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="text-white/90 hover:text-white"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <button
                    onClick={() => handleSkip(-10)}
                    className="text-white/90 hover:text-white"
                    aria-label="Skip back 10 seconds"
                  >
                    <RotateCcw size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleSkip(10)}
                    className="text-white/90 hover:text-white"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward size={18} />
                  </button>
                  
                  {/* Time */}
                  <div className="text-sm text-white/90">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                
                {/* Right Controls (Volume, Fullscreen) */}
                <div className="flex items-center space-x-4">
                  {/* Volume */}
                  <div 
                    className="relative flex items-center"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                  >
                    <button
                      onClick={toggleMute}
                      className="text-white/90 hover:text-white mr-2"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX size={20} />
                      ) : volume < 0.5 ? (
                        <Volume1 size={20} />
                      ) : (
                        <Volume2 size={20} />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 80 }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden"
                        >
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="cursor-pointer"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white/90 hover:text-white"
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}