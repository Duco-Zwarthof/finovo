type BudgetProgressBarProps = {
  percentage: number | null;
  status:
    | "unused"
    | "on-track"
    | "near-limit"
    | "over-budget";
};

function getProgressWidth(
  percentage: number | null
) {
  if (percentage === null) {
    return 0;
  }

  return Math.min(
    Math.max(percentage, 0),
    100
  );
}

function getProgressColor(
  status: BudgetProgressBarProps["status"]
) {
  switch (status) {
    case "over-budget":
      return "bg-red-500";

    case "near-limit":
      return "bg-amber-400";

    case "on-track":
      return "bg-emerald-500";

    default:
      return "bg-zinc-700";
  }
}

export default function BudgetProgressBar({
  percentage,
  status,
}: BudgetProgressBarProps) {
  const width = getProgressWidth(
    percentage
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-zinc-500">
          Budget usage
        </span>

        <span className="font-semibold text-zinc-300">
          {percentage === null
            ? "—"
            : `${Math.round(percentage)}%`}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Budget usage"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(
          Math.round(percentage ?? 0),
          100
        )}
        className="h-2 overflow-hidden rounded-full bg-zinc-800"
      >
        <div
          className={`h-full rounded-full transition-all ${getProgressColor(
            status
          )}`}
          style={{
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
}