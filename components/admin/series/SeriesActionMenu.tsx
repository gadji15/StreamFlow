import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeriesActionMenu({ onEdit, onDelete }) {
  return (
    <div className="flex flex-col bg-gray-900 rounded shadow-lg min-w-[120px] border border-gray-700">
      <Button variant="ghost" className="justify-start" onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" /> Éditer
      </Button>
      <Button variant="destructive" className="justify-start" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
      </Button>
    </div>
  );
}