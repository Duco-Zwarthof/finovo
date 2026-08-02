"use client";

import {
  Eye,
  EyeOff,
  RotateCcw,
  X,
} from "lucide-react";

import {
  widgetOptions,
} from "@/lib/dashboard-config";
import type {
  WidgetId,
  WidgetSettings,
} from "@/lib/storage";

type DashboardCustomizerProps = {
  isOpen: boolean;
  widgetSettings: WidgetSettings;
  visibleWidgetCount: number;
  onClose: () => void;
  onReset: () => void;
  onToggleWidget: (widgetId: WidgetId) => void;
};

export default function DashboardCustomizer({
  isOpen,
  widgetSettings,
  visibleWidgetCount,
  onClose,
  onReset,
  onToggleWidget,
}: DashboardCustomizerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <aside
        className="flex h-dvh w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-xl font-bold">
              Customize dashboard
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Choose which widgets appear on
              your homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close customization panel"
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {widgetOptions.map((widget) => {
              const isVisible =
                widgetSettings[widget.key];

              return (
                <button
                  key={widget.key}
                  type="button"
                  onClick={() =>
                    onToggleWidget(widget.key)
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    isVisible
                      ? "border-blue-500/20 bg-blue-500/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isVisible
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {isVisible ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                      {widget.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {widget.description}
                    </p>
                  </div>

                  <div
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      isVisible
                        ? "bg-blue-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        isVisible
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 p-6">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              Visible widgets
            </span>

            <span className="font-semibold text-white">
              {visibleWidgetCount} of{" "}
              {widgetOptions.length}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
