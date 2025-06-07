import React, { useEffect } from "react";
import { useFormAutosave } from "@/hooks/useFormAutosave";

// Type de base pour une saison
type Season = {
  number: string;
  description: string;
};

// Props de la modal
type SeasonModalProps = {
  open: boolean;
  onClose: () => void;
  season?: Season & { id?: string };
  adminId: string;
};

/**
 * Modal d'ajout/édition de saison avec autosauvegarde robuste.
 */
export default function SeasonModal({ open, onClose, season, adminId }: SeasonModalProps) {
  const isEdit = !!season?.id;
  const storageKey = isEdit
    ? `autosave-season-edit-${season.id}-${adminId}`
    : `autosave-season-add-${adminId}`;
  const initialState: Season = isEdit && season
    ? { number: season.number, description: season.description }
    : { number: "", description: "" };

  const [form, setForm, clearAutosave] = useFormAutosave(storageKey, initialState);

  useEffect(() => {
    if (isEdit && season) {
      setForm({
        number: season.number,
        description: season.description,
      });
    }
    // eslint-disable-next-line
  }, [season?.id]);

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
          {isEdit ? "Éditer une saison" : "Ajouter une saison"}
        </h2>
        <input
          name="number"
          value={form.number}
          onChange={handleChange}
          placeholder="Numéro de saison"
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