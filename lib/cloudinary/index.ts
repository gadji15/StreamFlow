// Version client-side qui utilise des API routes Next.js

/**
 * Convertit un fichier en base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Télécharge une image vers Cloudinary via l'API route
 */
export async function uploadImage(file: File): Promise<{ 
  secure_url: string; 
  public_id: string;
}> {
  try {
    // Convertir le fichier en base64
    const base64Data = await fileToBase64(file);
    
    // Appeler l'API route
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: base64Data,
        folder: 'streamflow' 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec du téléchargement de l\'image');
    }
    
    const data = await response.json();
    
    return {
      secure_url: data.secure_url,
      public_id: data.public_id
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    throw error;
  }
}

/**
 * Supprime une image de Cloudinary via l'API route
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        public_id: publicId 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de la suppression de l\'image');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return false;
  }
}

/**
 * Extrait le public_id depuis une URL Cloudinary
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Format typique: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567890/FOLDER/FILE.jpg
    const regex = /\/v\d+\/([^/]+\/[^.]+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1]; // Retourne "FOLDER/FILE"
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du public_id:', error);
    return null;
  }
}

/**
 * Récupère l'URL d'une image avec transformation (redimensionnement, etc.)
 */
export function getOptimizedImageUrl(
  url: string, 
  options: { 
    width?: number; 
    height?: number; 
    crop?: 'fill' | 'scale' | 'fit' | 'thumb';
    quality?: number;
  } = {}
): string {
  if (!url) return '';
  
  try {
    // Vérifier si c'est une URL Cloudinary
    if (!url.includes('cloudinary.com')) {
      return url; // Retourner l'URL originale si ce n'est pas Cloudinary
    }
    
    // Format de base: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567890/FOLDER/FILE.jpg
    const regex = /(https?:\/\/res.cloudinary.com\/[^\/]+\/)([^\/]+)\/([^\/]+)\/([^\/]+\/.*)/;
    const match = url.match(regex);
    
    if (!match) return url;
    
    const [, base, resourceType, deliveryType, path] = match;
    
    // Construire les transformations
    let transformations = '';
    
    if (options.width || options.height) {
      transformations += options.crop ? `c_${options.crop},` : 'c_fill,';
      if (options.width) transformations += `w_${options.width},`;
      if (options.height) transformations += `h_${options.height},`;
    }
    
    if (options.quality) {
      transformations += `q_${options.quality},`;
    }
    
    // Supprimer la virgule finale
    if (transformations.endsWith(',')) {
      transformations = transformations.slice(0, -1);
    }
    
    // Construire l'URL transformée
    if (transformations) {
      return `${base}${resourceType}/${deliveryType}/${transformations}/${path}`;
    }
    
    return url;
  } catch (error) {
    console.error('Erreur lors de la transformation de l\'URL:', error);
    return url;
  }
}