"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  onImageRemoved?: () => void;
  previewUrl?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImageSelected,
  onImageRemoved,
  previewUrl,
  label = "Ajouter une image",
  accept = "image/jpeg, image/png, image/webp",
  maxSizeMB = 5
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de la taille du fichier
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      setError(`La taille du fichier dépasse ${maxSizeMB}MB.`);
      return;
    }

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      setError("Le fichier sélectionné n'est pas une image.");
      return;
    }

    setError(null);
    
    // Génération du preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Callback
    onImageSelected(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-2">
      {!preview ? (
        <>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-400 text-center">{label}</p>
            <p className="text-xs text-gray-500 mt-1">
              {`Format: JPG, PNG ou WebP (max. ${maxSizeMB}MB)`}
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </>
      ) : (
        <div className="relative">
          <div className="aspect-[3/2] rounded-lg overflow-hidden bg-gray-800">
            <img 
              src={preview} 
              alt="Aperçu" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 rounded-full p-1 h-auto w-auto"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}