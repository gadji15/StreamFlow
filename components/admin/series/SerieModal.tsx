import React, { useEffect } from "react";
import { useFormAutosave } from "@/hooks/useFormAutosave";

// Type de base pour une série
type Serie = {
  title: string;
  synopsis: string;
  releaseYear: string;
};

// Props de la modal
type SerieModalProps = {
  open: boolean;
  onClose: () => void;
  serie?: Serie & { id?: string };
  adminId: string;
};

/**
 * Modal d'ajout/édition de série avec autosauvegarde robuste.
 */
export default function SerieModal({ open, onClose, serie, adminId }: SerieModalProps) {
  const isEdit = !!serie?.id;
  const storageKey = isEdit
    ? `autosave-serie-edit-${serie.id}-${adminId}`
    : `autosave-serie-add-${adminId}`;
  const initialState: Serie = isEdit && serie
    ? { title: serie.title, synopsis: serie.synopsis, releaseYear: serie.releaseYear }
    : { title: "", synopsis: "", releaseYear: "" };

  const [form, setForm, clearAutosave] = useFormAutosave(storageKey, initialState);

  useEffect(() => {
    if (isEdit && serie) {
      setForm({
        title: serie.title,
        synopsis: serie.synopsis,
        releaseYear: serie.releaseYear,
      });
    }
    // eslint-disable-next-line
  }, [serie?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO : logique d’ajout/édition réelle
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
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4 relative min-w-[350px]"
      >
        <h2 className="text-xl font-semibold mb-2">
          {isEdit ? "Éditer une série" : "Ajouter une série"}
        </h2>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Titre de la série"
          className="w-full p-2 rounded border"
          required
        />
        <textarea
          name="synopsis"
          value={form.synopsis}
          onChange={handleChange}
          placeholder="Synopsis"
          className="w-full p-2 rounded border"
        />
        <input
          name="releaseYear"
          value={form.releaseYear}
          onChange={handleChange}
          placeholder="Année de sortie"
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