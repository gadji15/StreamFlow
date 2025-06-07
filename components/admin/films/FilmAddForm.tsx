import React from "react";
import { useFormAutosave } from "@/hooks/useFormAutosave";

// Exemple d'état initial pour un film
const initialFilm = { title: "", description: "", year: "" };

export default function FilmAddForm({ adminId }: { adminId: string }) {
  // Clé unique pour chaque admin (évite les collisions de brouillons)
  const [film, setFilm, clearAutosave] = useFormAutosave(
    `autosave-film-add-${adminId}`,
    initialFilm
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFilm({ [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ici tu ajoutes la logique d'envoi à Supabase (ajout de film)
    // Exemple :
    // await supabase.from('films').insert([film]);
    clearAutosave();
    // Optionnel : reset local ou toast succès
    // setFilm(initialFilm);
    alert("Film ajouté et brouillon effacé !");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-gray-800 rounded shadow space-y-4">
      <input
        name="title"
        value={film.title}
        onChange={handleChange}
        placeholder="Titre"
        className="w-full p-2 rounded bg-gray-700 text-white"
        required
      />
      <textarea
        name="description"
        value={film.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <input
        name="year"
        value={film.year}
        onChange={handleChange}
        placeholder="Année"
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <div className="flex gap-3">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Ajouter</button>
        <button type="button" className="bg-red-600 text-white px-4 py-2 rounded" onClick={clearAutosave}>Réinitialiser le brouillon</button>
      </div>
    </form>
  );
}