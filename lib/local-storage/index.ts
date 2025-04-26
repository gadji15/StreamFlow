// AVERTISSEMENT: Ce stockage local est uniquement pour le développement
// Il stocke les images comme des chaînes Base64 dans Firestore
// NON RECOMMANDÉ POUR LA PRODUCTION (limites de taille Firestore)

import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/config";

// Convertir une image en Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Vérifier et optimiser une image
const optimizeImage = async (base64: string, maxSize: number = 500 * 1024): Promise<string> => {
  // Si l'image est déjà petite, la retourner telle quelle
  if (base64.length <= maxSize) return base64;
  
  // Sinon, la redimensionner
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculer les nouvelles dimensions
      const aspectRatio = width / height;
      
      // Réduire progressivement jusqu'à obtenir une taille acceptable
      let quality = 0.9;
      let result: string;
      
      do {
        // Réduire les dimensions
        if (base64.length > maxSize * 2) {
          width = Math.floor(width * 0.7);
          height = Math.floor(width / aspectRatio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exporter avec compression
        result = canvas.toDataURL('image/jpeg', quality);
        
        // Réduire la qualité si nécessaire
        quality -= 0.1;
      } while (result.length > maxSize && quality > 0.3);
      
      resolve(result);
    };
    
    img.onerror = reject;
    img.src = base64;
  });
};

// Stocker une image de poster dans Firestore
export const storeMoviePoster = async (file: File, movieId: string): Promise<string> => {
  try {
    // Vérifier la taille
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("L'image est trop volumineuse. Maximum 2MB.");
    }
    
    // Convertir en Base64
    let base64Image = await fileToBase64(file);
    
    // Optimiser si nécessaire
    if (base64Image.length > 500 * 1024) {
      base64Image = await optimizeImage(base64Image, 500 * 1024);
    }
    
    // Mettre à jour le document du film
    const movieRef = doc(firestore, "movies", movieId);
    await updateDoc(movieRef, {
      posterUrl: base64Image,
      updatedAt: new Date().toISOString()
    });
    
    return base64Image;
  } catch (error) {
    console.error("Erreur lors du stockage de l'image:", error);
    throw error;
  }
};

// Stocker une image de fond dans Firestore
export const storeMovieBackdrop = async (file: File, movieId: string): Promise<string> => {
  try {
    // Vérifier la taille
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("L'image est trop volumineuse. Maximum 2MB.");
    }
    
    // Convertir en Base64
    let base64Image = await fileToBase64(file);
    
    // Optimiser si nécessaire
    if (base64Image.length > 1000 * 1024) {
      base64Image = await optimizeImage(base64Image, 1000 * 1024);
    }
    
    // Mettre à jour le document du film
    const movieRef = doc(firestore, "movies", movieId);
    await updateDoc(movieRef, {
      backdropUrl: base64Image,
      updatedAt: new Date().toISOString()
    });
    
    return base64Image;
  } catch (error) {
    console.error("Erreur lors du stockage de l'image:", error);
    throw error;
  }
};