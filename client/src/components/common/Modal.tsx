import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-steel-950/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="corner-frame relative w-full max-w-md rounded-lg border border-steel-200 bg-white p-6 shadow-2xl dark:border-steel-800 dark:bg-steel-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="modal-title"
              className="font-display text-lg font-bold text-steel-900 dark:text-steel-50"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-steel-500 dark:text-steel-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-700 dark:text-steel-500 dark:hover:bg-steel-800 dark:hover:text-steel-200"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
