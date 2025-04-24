"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Trash2, Download, Info, Settings, Wifi, HardDrive } from "lucide-react"
import MobileNavigation from "@/components/mobile/mobile-navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

// Mock data for downloads
const downloadedContent = [
  {
    id: 1,
    title: "Interstellar",
    image: "/placeholder.svg?height=450&width=300",
    year: 2014,
    duration: "2h 49min",
    size: "4.2 GB",
    quality: "HD (1080p)",
    status: "completed",
    expiresIn: "29 jours",
  },
  {
    id: 2,
    title: "Inception",
    image: "/placeholder.svg?height=450&width=300",
    year: 2010,
    duration: "2h 28min",
    size: "3.8 GB",
    quality: "HD (1080p)",
    status: "completed",
    expiresIn: "15 jours",
  },
  {
    id: 3,
    title: "The Dark Knight",
    image: "/placeholder.svg?height=450&width=300",
    year: 2008,
    duration: "2h 32min",
    size: "4.5 GB",
    quality: "HD (1080p)",
    status: "downloading",
    progress: 65,
  },
  {
    id: 4,
    title: "Parasite",
    image: "/placeholder.svg?height=450&width=300",
    year: 2019,
    duration: "2h 12min",
    size: "3.2 GB",
    quality: "SD (720p)",
    status: "downloading",
    progress: 30,
  },
  {
    id: 5,
    title: "Dune",
    image: "/placeholder.svg?height=450&width=300",
    year: 2021,
    duration: "2h 35min",
    size: "4.8 GB",
    quality: "HD (1080p)",
    status: "queued",
  },
]

export default function DownloadsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "downloading">("all")
  const [showSettings, setShowSettings] = useState(false)

  const filteredContent = downloadedContent.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return item.status === "completed"
    if (activeTab === "downloading") return item.status === "downloading" || item.status === "queued"
    return true
  })

  const totalDownloaded = downloadedContent
    .filter((item) => item.status === "completed")
    .reduce((acc, item) => acc + Number.parseFloat(item.size.split(" ")[0]), 0)

  const formatSize = (size: number) => {
    return size.toFixed(1) + " GB"
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <MobileNavigation />

      <div className="pt-20 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Téléchargements</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Storage Info */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <HardDrive className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-white font-medium">Stockage</span>
            </div>
            <span className="text-gray-400 text-sm">{formatSize(totalDownloaded)} / 32.0 GB</span>
          </div>
          <Progress value={(totalDownloaded / 32) * 100} className="h-2 bg-gray-800" />
          <p className="text-gray-400 text-xs mt-2 flex items-center">
            <Wifi className="h-3 w-3 mr-1" />
            Téléchargement uniquement en Wi-Fi
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "all" ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Tous
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "downloading" ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("downloading")}
          >
            En cours
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "completed" ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Terminés
          </button>
        </div>

        {/* Downloads List */}
        <div className="space-y-4">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex p-3">
                  <div className="relative w-16 h-24 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span>{item.year}</span>
                      <span className="mx-1">•</span>
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span>{item.quality}</span>
                      <span className="mx-1">•</span>
                      <span>{item.size}</span>
                    </div>

                    {item.status === "downloading" && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-purple-400">{item.progress}% téléchargé</span>
                          <span className="text-gray-400">Reste: ~15 min</span>
                        </div>
                        <Progress value={item.progress} className="h-1.5 bg-gray-800" />
                      </div>
                    )}

                    {item.status === "queued" && (
                      <div className="mt-2">
                        <span className="text-gray-400 text-xs">En attente</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex border-t border-gray-800">
                  {item.status === "completed" ? (
                    <>
                      <Link
                        href={`/mobile/watch/${item.id}`}
                        className="flex-1 flex items-center justify-center py-3 text-white font-medium"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Regarder
                      </Link>
                      <button className="flex-1 flex items-center justify-center py-3 text-red-500 font-medium border-l border-gray-800">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </button>
                    </>
                  ) : item.status === "downloading" ? (
                    <>
                      <button className="flex-1 flex items-center justify-center py-3 text-white font-medium">
                        <Info className="h-4 w-4 mr-2" />
                        Détails
                      </button>
                      <button className="flex-1 flex items-center justify-center py-3 text-red-500 font-medium border-l border-gray-800">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 flex items-center justify-center py-3 text-white font-medium">
                        <Download className="h-4 w-4 mr-2" />
                        Démarrer
                      </button>
                      <button className="flex-1 flex items-center justify-center py-3 text-red-500 font-medium border-l border-gray-800">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Retirer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Download className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Aucun téléchargement</h3>
              <p className="text-gray-400 text-sm">Téléchargez des films et séries pour les regarder hors ligne</p>
            </div>
          )}
        </div>
      </div>

      {/* Download Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-900 rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Paramètres de téléchargement</h3>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Télécharger en Wi-Fi uniquement</p>
                    <p className="text-sm text-gray-400">Économisez vos données mobiles</p>
                  </div>
                  <div className="h-6 w-11 bg-purple-600 rounded-full relative">
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Qualité de téléchargement</p>
                    <p className="text-sm text-gray-400">HD (1080p)</p>
                  </div>
                  <Button variant="ghost" className="text-gray-400">
                    Modifier
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Emplacement de stockage</p>
                    <p className="text-sm text-gray-400">Stockage interne</p>
                  </div>
                  <Button variant="ghost" className="text-gray-400">
                    Modifier
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Téléchargement automatique</p>
                    <p className="text-sm text-gray-400">Télécharger les prochains épisodes</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-700 rounded-full relative">
                    <div className="absolute left-1 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-800">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setShowSettings(false)}
                >
                  Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
