import React, { useEffect } from "react";
import { useFormAutosave } from "@/hooks/useFormAutosave";

// Type de base pour un film
type Film = {
  title: string;
  description: string;
  year: string;
};

// Props de la modal : open (affichage), onClose (fermeture), film (édition), adminId (clé autosave)
type FilmModalProps = {
  open: boolean;
  onClose: () => void;
  film?: Film & { id?: string }; // si édition, il y a un id
  adminId: string;
};

/**
 * Modal d'ajout/édition de film avec autosauvegarde robuste.
 */
export default function FilmModal({ open, onClose, film, adminId }: FilmModalProps) {
  // Détermination du mode et de la clé d'autosave
  const isEdit = !!film?.id;
  const storageKey = isEdit
    ? `autosave-film-edit-${film.id}-${adminId}`
    : `autosave-film-add-${adminId}`;
  // État initial selon mode
  const initialState: Film = isEdit && film
    ? { title: film.title, description: film.description, year: film.year }
    : { title: "", description: "", year: "" };

  // Hook d'autosauvegarde
  const [form, setForm, clearAutosave] = useFormAutosave(storageKey, initialState);

  // Si on change de film à éditer, on recharge l'état initial (utile pour navigation/édition en chaîne)
  useEffect(() => {
    if (isEdit && film) {
      setForm({
        title: film.title,
        description: film.description,
        year: film.year,
      });
    }
    // eslint-disable-next-line
  }, [film?.id]);

  // Gestion des changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ [e.target.name]: e.target.value });
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO : logique d’ajout/édition réelle (API/Supabase)
    clearAutosave();
    onClose();
  };

  // Fermeture de la modal (avec nettoyage du brouillon)
  const handleClose = () => {
    clearAutosave();
    onClose();
  };

  // Ne rien rendre si la modal n’est pas ouverte
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4 relative min-w-[350px]"
      >
        <h2 className="text-xl font-semibold mb-2">
          {isEdit ? "Éditer un film" : "Ajouter un film"}
        </h2>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Titre"
          className="w-full p-2 rounded border"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 rounded border"
        />
        <input
          name="year"
          value={form.year}
          onChange={handleChange}
          placeholder="Année"
          className="w-full p-2 rounded border"
        />
        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 rounded bg-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-1 rounded bg-green-600 text-white"
          >
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}