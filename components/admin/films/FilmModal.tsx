import React, { useEffect } from "react";
import { useFormAutosave } from "@/hooks/useFormAutosave";

type Film = { title: string; description: string; year: string };
type FilmModalProps = {
  open: boolean;
  onClose: () => void;
  film?: Film & { id?: string }; // si édition, il y a un id
  adminId: string;
};

export default function FilmModal({ open, onClose, film, adminId }: FilmModalProps) {
  const isEdit = !!film?.id;
  const storageKey = isEdit
    ? `autosave-film-edit-${film.id}-${adminId}`
    : `autosave-film-add-${adminId}`;
  const initialState: Film = isEdit
    ? { title: film.title, description: film.description, year: film.year }
    : { title: "", description: "", year: "" };

  const [form, setForm, clearAutosave] = useFormAutosave(storageKey, initialState);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... logique ajout/édition ...
    clearAutosave();
    onClose();
  };

  const handleClose = () => {
    clearAutosave();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 relative min-w-[350px]">
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
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={handleClose} className="px-3 py-1 rounded bg-gray-400">Annuler</button>
          <button type="submit" className="px-4 py-1 rounded bg-green-600 text-white">
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}