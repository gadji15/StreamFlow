'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelected: (imageData: { url: string; publicId: string }) => void;
  initialImage?: string;
  folder?: string;
  className?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImageSelected,
  initialImage,
  folder = 'misc',
  className = 'w-full max-w-sm',
  maxSizeMB = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convertir une taille en bytes en format lisible
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Gérer la sélection d'un fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier la taille du fichier
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Fichier trop volumineux. Maximum: ${maxSizeMB}MB`);
      return;
    }
    
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      setUploadError('Format non supporté. Veuillez sélectionner une image.');
      return;
    }
    
    // Réinitialiser l'erreur
    setUploadError(null);
    
    // Afficher la prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Uploader l'image
    await uploadImage(file);
  };
  
  // Uploader l'image vers Cloudinary via notre API
  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Convertir en base64
      const base64 = await toBase64(file);
      
      // Appeler l'API
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          folder: folder
        })
      });
      
      // Gérer les erreurs
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
      
      // Récupérer l'URL et le public_id
      const data = await response.json();
      
      // Appeler le callback
      onImageSelected({
        url: data.secure_url,
        publicId: data.public_id
      });
      
      // Message de succès
      console.log(`Image uploadée (${formatFileSize(data.bytes)})`);
    } catch (error: any) {
      console.error('Erreur:', error);
      setUploadError(error.message || 'Erreur lors de l\'upload');
      // Réinitialiser la prévisualisation en cas d'erreur
      setPreviewUrl(initialImage || null);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected({ url: '', publicId: '' });
  };
  
  // Convertir un fichier en base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className={className}>
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-700">
          <img 
            src={previewUrl} 
            alt="Aperçu" 
            className="w-full h-auto object-cover" 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                Changer
              </Button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-2 text-sm">Upload en cours...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium mb-1">
              {isUploading ? 'Upload en cours...' : 'Cliquez pour sélectionner une image'}
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG ou WebP • Max {maxSizeMB}MB
            </p>
            {uploadError && (
              <p className="text-red-500 text-xs mt-2">
                {uploadError}
              </p>
            )}
            {isUploading && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}