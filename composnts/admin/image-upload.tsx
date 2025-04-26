import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  imageUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  className?: string;
  aspect?: 'square' | 'portrait' | 'landscape';
  label?: string;
  maxSize?: number; // en MB
  accept?: string;
}

export function ImageUpload({
  imageUrl,
  onUpload,
  onRemove,
  className = '',
  aspect = 'square',
  label = 'Télécharger une image',
  maxSize = 5, // 5MB par défaut
  accept = 'image/*'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Déterminer la classe d'aspect
  const aspectClass = {
    square: 'aspect-square',
    portrait: 'aspect-[2/3]',
    landscape: 'aspect-video'
  }[aspect];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille du fichier
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Le fichier est trop volumineux. Maximum ${maxSize}MB.`);
        return;
      }
      
      // Créer un aperçu
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Uploader le fichier
      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        setError('Erreur lors du téléchargement. Veuillez réessayer.');
        // Réinitialiser l'aperçu en cas d'erreur
        setPreview(imageUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className={`relative w-full ${aspectClass} rounded-lg overflow-hidden group border border-gray-700`}>
          <img 
            src={preview} 
            alt="Aperçu de l'image" 
            className="w-full h-full object-cover"
          />
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-sm text-white">Téléchargement...</p>
              </div>
            </div>
          )}
          
          {!isUploading && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <div className="flex space-x-2">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-700/80 text-white rounded-md hover:bg-gray-600/80 transition-colors text-sm">
                    Changer
                  </span>
                  <input 
                    type="file" 
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
                
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600/80 hover:bg-red-500/80"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`border-2 border-dashed border-gray-700 rounded-lg p-6 ${aspectClass} flex flex-col items-center justify-center text-center bg-gray-800/50`}>
          <div className="mb-4">
            <Upload className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400 mb-2">
            {label}
          </p>
          <label className="cursor-pointer">
            <span className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm">
              Parcourir
            </span>
            <input 
              type="file" 
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG ou WEBP. Max {maxSize}MB.
          </p>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}