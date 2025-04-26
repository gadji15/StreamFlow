// Cloudinary - Service de gestion des médias
// NOTE: Ce service est implémenté pour fonctionner côté serveur uniquement
// Utilisez les API routes pour interagir avec Cloudinary depuis le client

/**
 * Fonction pour télécharger une image vers Cloudinary via l'API
 */
export async function uploadImage(file: File, options: { 
  folder?: string; 
  transformation?: string;
  maxFileSize?: number; // en octets
}): Promise<{ 
  secure_url: string; 
  public_id: string;
  resource_type: string;
}> {
  const { folder = 'streamflow', transformation = '', maxFileSize = 5 * 1024 * 1024 } = options;
  
  // Vérifier la taille du fichier
  if (file.size > maxFileSize) {
    throw new Error(`La taille du fichier dépasse la limite maximale de ${maxFileSize / (1024 * 1024)}MB`);
  }
  
  // Convertir le fichier en base64
  const base64 = await fileToBase64(file);
  
  try {
    // Appeler l'API route pour uploader l'image
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: base64,
        folder,
        transformation
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Fonction pour uploader un poster de film
 */
export async function uploadMoviePoster(file: File): Promise<{ 
  secure_url: string; 
  public_id: string;
}> {
  try {
    const result = await uploadImage(file, {
      folder: 'streamflow/posters',
      transformation: 'c_fill,g_auto,h_800,w_600',
      maxFileSize: 5 * 1024 * 1024 // 5MB
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading movie poster:', error);
    throw error;
  }
}

/**
 * Fonction pour uploader un backdrop de film
 */
export async function uploadMovieBackdrop(file: File): Promise<{ 
  secure_url: string; 
  public_id: string;
}> {
  try {
    const result = await uploadImage(file, {
      folder: 'streamflow/backdrops',
      transformation: 'c_fill,g_auto,h_800,w_1600',
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading movie backdrop:', error);
    throw error;
  }
}

/**
 * Fonction pour uploader un avatar d'utilisateur
 */
export async function uploadUserAvatar(file: File): Promise<{ 
  secure_url: string; 
  public_id: string;
}> {
  try {
    const result = await uploadImage(file, {
      folder: 'streamflow/avatars',
      transformation: 'c_thumb,g_face,w_200,h_200,r_max',
      maxFileSize: 2 * 1024 * 1024 // 2MB
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading user avatar:', error);
    throw error;
  }
}

/**
 * Fonction pour supprimer une image
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
      throw new Error(errorData.message || 'Failed to delete image');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Fonction d'aide pour convertir un fichier en base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Fonction pour extraire le public_id depuis une URL Cloudinary
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    // Format typique: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
    const regex = /\/v\d+\/([^/]+\/[^.]+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1]; // Returns "folder/filename"
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}