'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  onImageRemoved?: () => void;
  previewUrl?: string;
  label?: string;
  aspectRatio?: string;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
  isLoading?: boolean;
}

export function ImageUpload({
  onImageSelected,
  onImageRemoved,
  previewUrl,
  label = "Ajouter une image",
  aspectRatio = "16:9",
  className = "",
  accept = "image/jpeg, image/png, image/webp",
  maxSizeMB = 5,
  isLoading = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`La taille du fichier dépasse ${maxSizeMB}MB.`);
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError("Le fichier sélectionné n'est pas une image.");
      return;
    }

    setError(null);
    
    // Créer un preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Appeler le callback avec le fichier sélectionné
    onImageSelected(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  // Définir les classes d'aspect ratio
  const aspectRatioClasses: Record<string, string> = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    '2:3': 'aspect-[2/3]'
  };
  
  const aspectRatioClass = aspectRatioClasses[aspectRatio] || 'aspect-video';

  return (
    <div className={`space-y-2 ${className}`}>
      {!preview ? (
        // Zone de dépôt sans image
        <div 
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`${aspectRatioClass} border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-400 text-center">{label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {`Format: JPG, PNG ou WebP (max. ${maxSizeMB}MB)`}
              </p>
            </>
          )}
        </div>
      ) : (
        // Affichage du preview
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
            onClick={handleRemove}
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
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={isLoading}
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

export default ImageUpload;