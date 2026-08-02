import { Plus, Target } from "lucide-react";

import { formatCurrency } from "@/lib/money";
import { amountMinorToEuroAmount } from "@/lib/transaction-amount";

type GoalHeroProps = {
  totalTargetMinor: number;
  totalProgressMinor: number;
  activeGoals: number;
  onAddGoal: () => void;
};

function formatMinorCurrency(amountMinor: number) {
  return formatCurrency(
    amountMinorToEuroAmount(amountMinor) ?? 0
  );
}

function calculateOverallProgress(
  currentMinor: number,
  targetMinor: number
) {
  if (targetMinor <= 0) {
    return 0;
  }

  return Math.min(
    (currentMinor / targetMinor) * 100,
    100
  );
}

export default function GoalHero({
  totalTargetMinor,
  totalProgressMinor,
  activeGoals,
  onAddGoal,
}: GoalHeroProps) {
  const overallProgress = calculateOverallProgress(
    totalProgressMinor,
    totalTargetMinor
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 px-6 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_68%)]" />

      <div className="relative grid gap-8 xl:grid-cols-[1.25fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Target size={17} />
            <span>Goal planning</span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Turn long-term plans into measurable progress.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Create savings goals, track progress and estimate the
            monthly contribution needed to reach each target.
          </p>

          <button
            type="button"
            onClick={onAddGoal}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            <Plus size={17} />
            Add goal
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Saved
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(totalProgressMinor)}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Target
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {formatMinorCurrency(totalTargetMinor)}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Progress
            </p>

            <p className="mt-3 text-2xl font-bold tracking-tight text-white">
              {Math.round(overallProgress * 10) / 10}%
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {activeGoals} active{" "}
              {activeGoals === 1 ? "goal" : "goals"}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
