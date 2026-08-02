type WidgetSize = {
  width: number;
  height: number;
};

export default function ExpandedStatCard({
  title,
  value,
  description,
  size,
  secondaryLabel,
  secondaryValue,
  insight,
}: {
  title: string;
  value: string;
  description: string;
  size: WidgetSize;
  secondaryLabel: string;
  secondaryValue: string;
  insight: string;
}) {
  const isWide = size.width >= 5;
  const isTall = size.height >= 3;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-5 shadow-lg shadow-black/10">
      <div>
        <p className="text-sm font-medium text-zinc-400">
          {title}
        </p>

        <p className="mt-3 text-3xl font-bold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      {(isWide || isTall) && (
        <div className="mt-auto pt-5">
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
              {secondaryLabel}
            </p>

            <p className="mt-2 text-lg font-semibold text-zinc-200">
              {secondaryValue}
            </p>

            {isTall && (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {insight}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
