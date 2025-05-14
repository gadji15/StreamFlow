import React from "react";

export default function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        published ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-400"
      }`}
    >
      {published ? "Publiée" : "Brouillon"}
    </span>
  );
}