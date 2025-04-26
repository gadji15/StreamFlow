import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "./config";

// Convertir une image en base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

// Sauvegarder une image de poster directement dans le document du film
export const saveMoviePosterAsBase64 = async (
  file: File,
  movieId: string
): Promise<string> => {
  try {
    // Vérifier la taille du fichier (limite de 1MB pour Firestore)
    if (file.size > 1000000) {
      throw new Error("Le fichier est trop volumineux. Maximum 1MB pour le stockage Base64.");
    }
    
    // Convertir en base64
    const base64Image = await fileToBase64(file);
    
    // Mettre à jour le document du film avec l'image en base64
    const movieRef = doc(firestore, "movies", movieId);
    await updateDoc(movieRef, {
      posterBase64: base64Image,
      updatedAt: new Date().toISOString()
    });
    
    return base64Image;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'image en base64:", error);
    throw error;
  }
};