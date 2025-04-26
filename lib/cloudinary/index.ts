// Cette version utilise des requêtes fetch à notre API au lieu d'utiliser directement Cloudinary côté client

/**
 * Fonction pour télécharger une image vers Cloudinary via notre API
 */
export async function uploadImage(file: File): Promise<{ 
  secure_url: string; 
  public_id: string;
  name: string;
}> {
  // Convertir le fichier en base64
  const base64 = await fileToBase64(file);
  
  // Appeler notre API route
  const response = await fetch('/api/cloudinary-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      image: base64,
      folder: 'streamflow' 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  const data = await response.json();
  
  return {
    secure_url: data.url,
    public_id: data.public_id,
    name: file.name
  };
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
 * Fonction pour supprimer une image de Cloudinary via notre API
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const response = await fetch('/api/cloudinary-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      public_id: publicId 
    }),
  });

  if (!response.ok) {
    return false;
  }

  return true;
}