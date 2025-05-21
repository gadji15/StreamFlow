"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"

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

  // Handler for next episode navigation
  const handleNextEpisode = () => {
    if (videoData.nextEpisode?.id) {
      window.location.href = `/watch/${videoData.nextEpisode.id}`
    }
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

      {/* Shared Video Player */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto">
          <VideoPlayer
            src={videoData.src}
            poster={videoData.thumbnail}
            title={videoData.title}
            autoPlay
            nextEpisode={videoData.nextEpisode
              ? {
                  title: videoData.nextEpisode.title,
                  onPlay: handleNextEpisode,
                }
              : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}