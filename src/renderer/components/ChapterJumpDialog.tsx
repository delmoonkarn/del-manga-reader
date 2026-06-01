import { useEffect } from "react";
import { FolderRow, toLocalUrl } from "../api";

type Props = {
  target: FolderRow;
  direction: "next" | "prev";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ChapterJumpDialog({ target, direction, onConfirm, onCancel }: Props) {
  // Esc cancels, Enter confirms. Stop propagation so the Reader's own keyboard
  // handler doesn't double-act.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      }
    };
    window.addEventListener("keydown", onKey, true); // capture-phase
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onConfirm, onCancel]);

  const heading = direction === "next" ? "Continue to next chapter" : "Go back to previous chapter";
  const confirmLabel = direction === "next" ? "Read ▸" : "◂ Read";

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
          <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">{heading}</div>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-100 text-sm leading-none"
            title="Cancel (Esc)"
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex gap-4">
          <div className="w-28 shrink-0 aspect-[2/3] bg-neutral-800 overflow-hidden rounded ring-1 ring-neutral-800">
            {target.cover_path ? (
              <img
                src={toLocalUrl(target.cover_path)}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                no cover
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-sm text-neutral-100 font-medium leading-snug break-words"
              title={target.name}
            >
              {target.name}
            </div>
            <div className="mt-1.5 text-xs text-neutral-500 tabular-nums">
              {target.image_count} {target.image_count === 1 ? "page" : "pages"}
            </div>
            {target.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {target.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-neutral-900 bg-neutral-900/30">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
