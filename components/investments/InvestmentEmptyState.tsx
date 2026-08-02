import { Plus, TrendingUp } from "lucide-react";

type InvestmentEmptyStateProps = {
  onAddHolding: () => void;
};

export default function InvestmentEmptyState({
  onAddHolding,
}: InvestmentEmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <TrendingUp size={27} />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-white">
        No investments yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Add your first ETF, stock, crypto or other holding to start
        tracking your portfolio.
      </p>

      <button
        type="button"
        onClick={onAddHolding}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <Plus size={17} />
        Add holding
      </button>
    </div>
  );
}
