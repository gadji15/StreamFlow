"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Eye, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CastMemberInputProps {
  castMember: {
    name: string
    character: string
    photo: string
  }
  onChange: (field: string, value: string) => void
  onRemove: () => void
  onUploadPhoto: () => void
}

export function CastMemberInput({ castMember, onChange, onRemove, onUploadPhoto }: CastMemberInputProps) {
  return (
    <div className="border border-gray-800 rounded-lg p-3 sm:p-4 bg-gray-950/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-4">
        <h4 className="text-white font-medium">Acteur</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
        <div>
          <Label htmlFor="cast-name" className="text-gray-300">
            Nom de l'acteur
          </Label>
          <Input
            id="cast-name"
            value={castMember.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="Nom de l'acteur"
          />
        </div>
        <div>
          <Label htmlFor="cast-character" className="text-gray-300">
            Rôle / Personnage
          </Label>
          <Input
            id="cast-character"
            value={castMember.character}
            onChange={(e) => onChange("character", e.target.value)}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="Nom du personnage"
          />
        </div>
        <div>
          <Label className="text-gray-300">Photo</Label>
          <div className="border border-dashed border-gray-700 rounded-lg p-2 text-center mt-1 h-[38px]">
            {castMember.photo ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative h-6 w-6 mr-2">
                    <Image
                      src={castMember.photo || "/placeholder.svg"}
                      alt={castMember.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-300 truncate max-w-[100px]">{castMember.name || "Photo"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => onChange("photo", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" className="h-full w-full p-0 text-gray-400" onClick={onUploadPhoto}>
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-xs">Télécharger une photo</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface VideoFileInputProps {
  videoFile: string
  onUpload: () => void
  onRemove: () => void
}

export function VideoFileInput({ videoFile, onUpload, onRemove }: VideoFileInputProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = () => {
    // Simulate file upload progress
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          onUpload()
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-4">
      <Label className="text-gray-300">Fichier vidéo</Label>
      <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center">
        {isUploading ? (
          <div className="py-8">
            <p className="text-gray-300 mb-2">Téléchargement en cours...</p>
            <div className="max-w-md mx-auto">
              <Progress value={uploadProgress} className="h-2 mb-2" />
              <p className="text-sm text-gray-400">{uploadProgress}% terminé</p>
            </div>
          </div>
        ) : videoFile ? (
          <div className="py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-500"
                >
                  <path d="M12 2v8L22 6v12L12 14v8L2 18V6l10-4z" />
                </svg>
              </div>
            </div>
            <p className="text-white font-medium mb-1">Fichier vidéo téléchargé</p>
            <p className="text-gray-400 text-sm mb-4">{videoFile.split("/").pop()}</p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-700 text-gray-300"
                onClick={() => window.open(videoFile, "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-700 text-red-400 hover:text-red-300"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-500 mb-4" />
            </div>
            <p className="text-gray-400 mb-4">Glissez-déposez un fichier vidéo ou cliquez pour parcourir</p>
            <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300" onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Télécharger un fichier vidéo
            </Button>
            <p className="text-gray-500 text-xs mt-2">Formats supportés: MP4, WebM, MKV. Taille max: 8GB</p>
          </div>
        )}
      </div>
    </div>
  )
}
