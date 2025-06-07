import React, { useEffect } from "react";
import { useFormAutosave } from "@/hooks/useFormAutosave";

type Episode = { title: string; number: string; description: string };
type EpisodeModalProps = {
  open: boolean;
  onClose: () => void;
  episode?: Episode & { id?: string };
  adminId: string;
};

export default function EpisodeModal({ open, onClose, episode, adminId }: EpisodeModalProps) {
  const isEdit = !!episode?.id;
  const storageKey = isEdit
    ? `autosave-episode-edit-${episode.id}-${adminId}`
    : `autosave-episode-add-${adminId}`;
  const initialState: Episode = isEdit
    ? { title: episode.title, number: episode.number, description: episode.description }
    : { title: "", number: "", description: "" };

  const [form, setForm, clearAutosave] = useFormAutosave(storageKey, initialState);

  useEffect(() => {
    if (isEdit && episode) {
      setForm({
        title: episode.title,
        number: episode.number,
        description: episode.description,
      });
    }
    // eslint-disable-next-line
  }, [episode?.id]);

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
          placeholder="Titre de l'épisode"
          className="w-full p-2 rounded border"
          required
        />
        <input
          name="number"
          value={form.number}
          onChange={handleChange}
          placeholder="Numéro"
          className="w-full p-2 rounded border"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
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