"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  onImageRemoved?: () => void;
  previewUrl?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  isLoading?: boolean;
  className?: string;
  aspectRatio?: string; // '1:1', '16:9', '4:3', etc.
}

export function ImageUpload({
  onImageSelected,
  onImageRemoved,
  previewUrl,
  label = "Ajouter une image",
  accept = "image/jpeg, image/png, image/webp",
  maxSizeMB = 5,
  isLoading = false,
  className = "",
  aspectRatio = "16:9"
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

  // Calculer les classes d'aspect ratio
  let aspectRatioClass = "aspect-video"; // default 16:9
  if (aspectRatio === "1:1") aspectRatioClass = "aspect-square";
  if (aspectRatio === "4:3") aspectRatioClass = "aspect-[4/3]";
  if (aspectRatio === "3:2") aspectRatioClass = "aspect-[3/2]";
  if (aspectRatio === "2:3") aspectRatioClass = "aspect-[2/3]";
  if (aspectRatio === "9:16") aspectRatioClass = "aspect-[9/16]";

  return (
    <div className={`space-y-2 ${className}`}>
      {!preview ? (
        <>
          <div 
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`${aspectRatioClass} border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-400 text-center">{label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {`Format: JPG, PNG ou WebP (max. ${maxSizeMB}MB)`}
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
            disabled={isLoading}
          />
        </>
      ) : (
        <div className="relative">
          <div className={`${aspectRatioClass} rounded-lg overflow-hidden bg-gray-800`}>
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
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

// Exportation par défaut pour compatibilité avec les deux types d'import
export default ImageUpload;
