import type { ReactNode } from "react";

type DashboardSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
