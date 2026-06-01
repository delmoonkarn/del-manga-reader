import { useEffect, useRef, useState } from "react";
import { api } from "../api";

type Props = {
  folderId: number;
  currentName: string;
  onRenamed: (newName: string) => void;
  onCancel: () => void;
};

export default function RenameDialog({ folderId, currentName, onRenamed, onCancel }: Props) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus + select on open so the user can immediately type a replacement.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    // Select the name without extension if there's a "[tag] name" pattern; otherwise full.
    el.select();
  }, []);

  // Capture-phase Esc so we don't fall through to the Reader's handlers.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onCancel]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    if (trimmed === currentName) {
      onCancel();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.renameFolder(folderId, trimmed);
      onRenamed(trimmed);
    } catch (e: unknown) {
      setError((e as Error).message ?? String(e));
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl w-[440px] max-w-[92vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-900 bg-neutral-900/40">
          <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
            Rename folder
          </div>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-100 text-sm leading-none"
            title="Cancel (Esc)"
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-[11px] text-neutral-500">
            The folder on disk will be renamed. Subfolders and tag links are updated automatically.
          </div>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="folder name"
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={saving}
          />
          {error && <div className="text-xs text-red-400 break-words">{error}</div>}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-neutral-900 bg-neutral-900/30">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !name.trim() || name.trim() === currentName}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-sm font-medium"
          >
            {saving ? "Renaming…" : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
}
