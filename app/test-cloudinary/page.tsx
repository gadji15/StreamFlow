"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/image-upload';
import { uploadImage } from '@/lib/cloudinary';
import { Loader2 } from 'lucide-react';

export default function TestCloudinaryPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setTestResult(null);
    
    try {
      // Test d'upload Cloudinary
      const uploadedUrl = await uploadImage(file, {
        folder: 'streamflow-test',
        publicId: `test-${Date.now()}`
      });
      
      setImageUrl(uploadedUrl);
      setTestResult('success');
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setTestResult('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test de Cloudinary</h1>
      <p className="mb-8 text-gray-400">
        Cette page vous permet de tester si votre configuration Cloudinary fonctionne correctement.
        Téléchargez une image pour vérifier.
      </p>
      
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Upload de test</h2>
        
        <ImageUpload
          imageUrl={imageUrl}
          onUpload={handleUpload}
          onRemove={() => setImageUrl('')}
          label="Télécharger une image de test"
        />
        
        {isUploading && (
          <div className="mt-4 flex items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            <span>Test en cours...</span>
          </div>
        )}
        
        {testResult === 'success' && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-md">
            <p className="text-green-400">✅ Configuration Cloudinary fonctionnelle!</p>
            <p className="text-sm text-gray-400 mt-2">L'image a été téléchargée avec succès.</p>
          </div>
        )}
        
        {testResult === 'error' && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
            <p className="text-red-400">❌ Erreur de configuration Cloudinary</p>
            <p className="text-sm text-gray-400 mt-2">{errorMessage}</p>
            <p className="text-sm text-gray-400 mt-2">
              Vérifiez vos clés dans .env.local et assurez-vous qu'elles sont correctes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}