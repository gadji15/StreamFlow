import React, { useState, useRef, useEffect } from "react";

export default function InlineEdit({ value, type = "text", onSave, min } : { value: any, type?: string, onSave: (v:any)=>Promise<boolean|void>, min?: number }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => { setDraft(value); }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { handleSave(); }
    if (e.key === "Escape") { setEditing(false); setDraft(value); }
  };

  const handleSave = async () => {
    if (draft === value) return setEditing(false);
    const ok = await onSave(draft);
    if (ok !== false) setEditing(false);
  };

  return editing ? (
    <input
      ref={inputRef}
      type={type}
      min={min}
      value={draft}
      onChange={e => setDraft(type === "number" ? Number(e.target.value) : e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className="border px-1 py-0.5 rounded w-16 bg-gray-900 text-xs"
      aria-label="Édition inline"
    />
  ) : (
    <span
      tabIndex={0}
      className="inline-block px-1 py-0.5 rounded cursor-pointer hover:bg-indigo-900/30"
      onClick={() => setEditing(true)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setEditing(true); }}
      aria-label="Cliquer pour éditer"
      role="button"
    >
      {String(value)}
    </span>
  );
}