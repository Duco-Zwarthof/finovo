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
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <header>
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {description && (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        )}
      </header>

      <div className="mt-6">{children}</div>
    </article>
  );
}
