import type { ReactNode } from "react";

type DashboardPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function DashboardPanel({
  title,
  description,
  children,
}: DashboardPanelProps) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <header className="shrink-0">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-zinc-400">
            {description}
          </p>
        )}
      </header>

      <div className="mt-6 min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    </article>
  );
}