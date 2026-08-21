"use client";

import {
  AlertTriangle,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
} from "react";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const confirmClasses = {
  danger:
    "bg-red-600 hover:bg-red-500 focus:ring-red-400/60",
  warning:
    "bg-amber-600 hover:bg-amber-500 focus:ring-amber-400/60",
  default:
    "bg-blue-600 hover:bg-blue-500 focus:ring-blue-400/60",
} as const;

export default function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActive =
      document.activeElement;

    dialogRef.current?.focus();

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !busy
      ) {
        onCancel();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      if (
        previousActive instanceof
        HTMLElement
      ) {
        previousActive.focus();
      }
    };
  }, [
    busy,
    onCancel,
    open,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !busy
        ) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="finovo-confirm-title"
        aria-describedby="finovo-confirm-description"
        tabIndex={-1}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/40 outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <AlertTriangle
              size={20}
            />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close confirmation"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="finovo-confirm-title"
          className="mt-5 text-xl font-bold text-white"
        >
          {title}
        </h2>

        <p
          id="finovo-confirm-description"
          className="mt-2 text-sm leading-6 text-zinc-400"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${confirmClasses[tone]}`}
          >
            {busy
              ? "Working…"
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
